export function resolveOgMessage(message: string, hideMessage = false): string {
  if (hideMessage) return '';
  const trimmed = message.trim();
  return trimmed || '하고싶은 말';
}
