export function getAvatarUrl(avatarUrl?: string | null): string {
  if (!avatarUrl) return '/images/avatars/nebula.webp';
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://') || avatarUrl.startsWith('/')) {
    return avatarUrl;
  }
  return `/images/avatars/${avatarUrl}.webp`;
}
