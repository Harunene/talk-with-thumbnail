#!/usr/bin/env python3
"""Match wiki Portrait (opaque bust) to standing sprite via SIFT + RANSAC similarity."""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass

import cv2
import numpy as np


@dataclass
class Region:
    x: int
    y: int
    width: int
    height: int


def read_rgba(path: str) -> np.ndarray:
    image = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if image is None:
        raise FileNotFoundError(f"Could not read image: {path}")
    if image.ndim == 2:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGRA)
    elif image.shape[2] == 3:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2BGRA)
    return image


def alpha_bounds(image: np.ndarray, threshold: int = 16) -> tuple[int, int, int, int]:
    alpha = image[:, :, 3]
    ys, xs = np.where(alpha > threshold)
    if len(xs) == 0:
        h, w = image.shape[:2]
        return 0, 0, w, h
    return int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())


def crop_region(image: np.ndarray, region: Region) -> np.ndarray:
    return image[
        region.y : region.y + region.height,
        region.x : region.x + region.width,
    ].copy()


def portrait_opaque_region(image: np.ndarray) -> Region:
    min_x, min_y, max_x, max_y = alpha_bounds(image)
    return Region(min_x, min_y, max_x - min_x + 1, max_y - min_y + 1)


def sprite_upper_search_region(image: np.ndarray) -> Region:
    """SIFT search: standing sprite upper bust area."""
    min_x, min_y, max_x, max_y = alpha_bounds(image)
    body_height = max_y - min_y
    crop_height = max(48, int(body_height * 0.45))
    return Region(min_x, min_y, max_x - min_x + 1, crop_height)


def to_gray_and_mask(image: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    gray = cv2.cvtColor(image[:, :, :3], cv2.COLOR_BGR2GRAY)
    mask = (image[:, :, 3] > 16).astype(np.uint8) * 255
    return gray, mask


def build_matched_rect(
    sprite_w: int,
    sprite_h: int,
    left: float,
    top: float,
    width: float,
    height: float,
) -> dict:
    crop_w = max(1, int(round(width)))
    crop_h = max(1, int(round(height)))
    crop_left = int(round(max(0, min(sprite_w - crop_w, left))))
    crop_top = int(round(max(0, min(sprite_h - crop_h, top))))
    return {
        "anchorX": round(crop_left + crop_w / 2, 2),
        "faceTop": crop_top,
        "faceCrop": {
            "left": crop_left,
            "top": crop_top,
            "width": crop_w,
            "height": crop_h,
        },
    }


def _rect_from_similarity(
    M: np.ndarray,
    portrait_w: int,
    portrait_h: int,
    sprite_region: Region,
    sprite_shape: tuple[int, int],
) -> dict:
    corners = np.float32(
        [[0, 0], [portrait_w, 0], [portrait_w, portrait_h], [0, portrait_h]],
    ).reshape(-1, 1, 2)
    mapped = cv2.transform(corners, M)
    mapped[:, 0, 0] += sprite_region.x
    mapped[:, 0, 1] += sprite_region.y
    xs = mapped[:, 0, 0]
    ys = mapped[:, 0, 1]
    sprite_h, sprite_w = sprite_shape
    return build_matched_rect(
        sprite_w,
        sprite_h,
        float(xs.min()),
        float(ys.min()),
        float(xs.max() - xs.min()),
        float(ys.max() - ys.min()),
    )


def sift_match(portrait_roi: np.ndarray, sprite: np.ndarray, sprite_shape: tuple[int, int]) -> dict:
    sprite_region = sprite_upper_search_region(sprite)
    sprite_roi = crop_region(sprite, sprite_region)
    portrait_gray, portrait_mask = to_gray_and_mask(portrait_roi)
    sprite_gray, sprite_mask = to_gray_and_mask(sprite_roi)

    sift = cv2.SIFT_create(nfeatures=1200, contrastThreshold=0.02, edgeThreshold=10)
    kp_p, des_p = sift.detectAndCompute(portrait_gray, portrait_mask)
    kp_s, des_s = sift.detectAndCompute(sprite_gray, sprite_mask)

    if des_p is None or des_s is None or len(kp_p) < 8 or len(kp_s) < 8:
        raise RuntimeError("not enough SIFT features")

    matcher = cv2.BFMatcher(cv2.NORM_L2)
    knn = matcher.knnMatch(des_p, des_s, k=2)
    good: list[cv2.DMatch] = []
    for pair in knn:
        if len(pair) != 2:
            continue
        first, second = pair
        if first.distance < 0.75 * second.distance:
            good.append(first)

    if len(good) < 8:
        raise RuntimeError(f"too few good matches: {len(good)}")

    src_pts = np.float32([kp_p[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst_pts = np.float32([kp_s[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)

    M, inliers = cv2.estimateAffinePartial2D(
        src_pts,
        dst_pts,
        method=cv2.RANSAC,
        ransacReprojThreshold=3.5,
        maxIters=3000,
        confidence=0.995,
    )
    if M is None:
        raise RuntimeError("estimateAffinePartial2D failed")

    inlier_mask = inliers.ravel() == 1 if inliers is not None else np.zeros(len(good), dtype=bool)
    inlier_count = int(inlier_mask.sum())
    if inlier_count < 6:
        raise RuntimeError(f"too few inliers: {inlier_count}")

    scale = float(np.sqrt(M[0, 0] ** 2 + M[1, 0] ** 2))
    ph, pw = portrait_roi.shape[:2]
    face = _rect_from_similarity(M, pw, ph, sprite_region, sprite_shape)
    inlier_ratio = inlier_count / len(good)
    score = min(1.0, (inlier_count / 24.0) * (0.35 + 0.65 * inlier_ratio))

    return {
        "score": round(score, 4),
        "rawScore": round(float(len(good)), 4),
        "goodMatches": len(good),
        "inliers": inlier_count,
        "inlierRatio": round(inlier_ratio, 4),
        "scale": round(scale, 4),
        **face,
        "method": "sift",
    }


def _portrait_meta(portrait: np.ndarray, portrait_path: str, sprite: np.ndarray) -> dict:
    portrait_region = portrait_opaque_region(portrait)
    sprite_h, sprite_w = sprite.shape[:2]
    return {
        "spriteWidth": sprite_w,
        "spriteHeight": sprite_h,
        "portraitFile": portrait_path.split("/")[-1],
        "portraitWidth": int(portrait.shape[1]),
        "portraitHeight": int(portrait.shape[0]),
        "portraitTemplate": {
            "x": portrait_region.x,
            "y": portrait_region.y,
            "width": portrait_region.width,
            "height": portrait_region.height,
        },
    }


def match_portrait_to_sprite(sprite_path: str, portrait_path: str) -> dict:
    sprite = read_rgba(sprite_path)
    portrait = read_rgba(portrait_path)
    portrait_region = portrait_opaque_region(portrait)
    portrait_roi = crop_region(portrait, portrait_region)
    sprite_shape = sprite.shape[:2]
    meta = _portrait_meta(portrait, portrait_path, sprite)
    return {**sift_match(portrait_roi, sprite, sprite_shape), **meta}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sprite", required=True)
    parser.add_argument("--portrait", required=True)
    args = parser.parse_args()

    try:
        result = match_portrait_to_sprite(args.sprite, args.portrait)
        print(json.dumps(result, ensure_ascii=False))
        return 0
    except Exception as error:  # noqa: BLE001
        print(json.dumps({"error": str(error)}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
