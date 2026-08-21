export interface AvatarOption {
  id: string;
  name: string;
  image: string;
  cls: string;
}

export const AVATARS: AvatarOption[] = [
  { id: 'av1', name: 'Nebula', image: '/images/avatars/nebula.webp', cls: 'bg-gradient-1' },
  { id: 'av2', name: 'Nova', image: '/images/avatars/nova.webp', cls: 'bg-gradient-2' },
  { id: 'av3', name: 'Quasar', image: '/images/avatars/quasar.webp', cls: 'bg-gradient-3' },
  { id: 'av4', name: 'Pulsar', image: '/images/avatars/pulsar.webp', cls: 'bg-gradient-to-br from-fuchsia-500 to-cyan-500' },
  { id: 'av5', name: 'Void', image: '/images/avatars/void.webp', cls: 'bg-gradient-to-br from-indigo-500 to-purple-600' },
];

export function getAvatarUrl(avatarIdOrUrl?: string | null): string {
  if (!avatarIdOrUrl) return '/images/avatars/nebula.webp';
  if (
    avatarIdOrUrl.startsWith('http://') ||
    avatarIdOrUrl.startsWith('https://') ||
    avatarIdOrUrl.startsWith('/images/avatars/') ||
    avatarIdOrUrl.startsWith('data:')
  ) {
    return avatarIdOrUrl;
  }
  const clean = avatarIdOrUrl.replace(/\.webp$/i, '').toLowerCase();
  const match = AVATARS.find(
    (a) => a.id.toLowerCase() === clean || a.name.toLowerCase() === clean
  );
  if (match) return match.image;
  return '/images/avatars/nebula.webp';
}

export function getAvatarCls(avatarIdOrUrl?: string | null): string {
  if (!avatarIdOrUrl) return 'bg-gradient-1';
  const clean = avatarIdOrUrl.replace(/\.webp$/i, '').toLowerCase();
  const match = AVATARS.find(
    (a) =>
      a.id.toLowerCase() === clean ||
      a.image === avatarIdOrUrl ||
      a.name.toLowerCase() === clean
  );
  if (match) return match.cls;
  return 'bg-gradient-1';
}
