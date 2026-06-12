#!/usr/bin/env python3
"""SIFT portrait 패치 위 fuyucc yolov8_animeface → 표정 icon crop (sprite 좌표)."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
MODEL = ROOT / "models" / "anime-face" / "yolov8x6_animeface.pt"
MATCH_SCRIPT = ROOT / "scripts" / "match_portrait_face.py"
CONF = 0.25
MATCH_MIN_SCORE = 0.12

_model = None


def run_sift(sprite_path: Path, portrait_path: Path) -> dict:
    out = subprocess.check_output(
        [
            sys.executable,
            str(MATCH_SCRIPT),
            "--sprite",
            str(sprite_path),
            "--portrait",
            str(portrait_path),
        ],
        text=True,
    )
    return json.loads(out)


def get_model():
    global _model
    if _model is None:
        if not MODEL.exists():
            raise FileNotFoundError(
                f"Missing {MODEL}. Download:\n"
                "curl -fsSL -o models/anime-face/yolov8x6_animeface.pt "
                "https://github.com/Fuyucch1/yolov8_animeface/releases/download/v1/yolov8x6_animeface.pt",
            )
        from ultralytics import YOLO

        _model = YOLO(str(MODEL))
    return _model


def detect_face_patch(patch_bgr: np.ndarray) -> tuple[float, float, float, float, float]:
    model = get_model()
    results = model.predict(patch_bgr, conf=CONF, verbose=False)
    best = None
    for result in results:
        if result.boxes is None:
            continue
        for box in result.boxes:
            score = float(box.conf[0])
            if best is None or score > best[0]:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                best = (score, x1, y1, x2 - x1, y2 - y1)
    if best is None:
        raise RuntimeError("fuyucc: no face detected in portrait patch")
    return best


def face_box_to_icon_crop(
    left: float,
    top: float,
    width: float,
    height: float,
    patch_ox: int,
    patch_oy: int,
) -> dict:
    """노란선 bbox → 정사각 icon (side=max(w,h), 추가 padding 없음)."""
    cx = left + width / 2
    cy = top + height / 2
    side = max(width, height)
    return {
        "left": round(patch_ox + cx - side / 2, 2),
        "top": round(patch_oy + cy - side / 2, 2),
        "width": round(side, 2),
        "height": round(side, 2),
    }


def detect_face_icon(sprite_path: str, portrait_path: str) -> dict:
    sprite = Path(sprite_path)
    portrait = Path(portrait_path)
    sift = run_sift(sprite, portrait)
    if sift.get("score", 0) < MATCH_MIN_SCORE:
        raise RuntimeError(f"sift score too low: {sift.get('score')}")

    image = cv2.imread(str(sprite), cv2.IMREAD_UNCHANGED)
    if image is None:
        raise FileNotFoundError(sprite)

    fc = sift["faceCrop"]
    ox, oy = int(fc["left"]), int(fc["top"])
    w, h = int(fc["width"]), int(fc["height"])
    patch = image[oy : oy + h, ox : ox + w]
    patch_bgr = cv2.cvtColor(patch, cv2.COLOR_BGRA2BGR)

    score, fx, fy, fw, fh = detect_face_patch(patch_bgr)
    icon = face_box_to_icon_crop(fx, fy, fw, fh, ox, oy)

    return {
        "method": "fuyucc_yolov8x6",
        "siftScore": sift["score"],
        "siftScale": sift["scale"],
        "siftFaceCrop": fc,
        "faceScore": round(score, 4),
        "faceBoxPatch": {
            "left": round(fx, 2),
            "top": round(fy, 2),
            "width": round(fw, 2),
            "height": round(fh, 2),
        },
        "iconCrop": icon,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sprite", required=True)
    parser.add_argument("--portrait", required=True)
    args = parser.parse_args()

    try:
        result = detect_face_icon(args.sprite, args.portrait)
        print(json.dumps(result, ensure_ascii=False))
        return 0
    except Exception as error:  # noqa: BLE001
        print(json.dumps({"error": str(error)}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
