const icons = [
  '🐭',
  '🐹',
  '🐰',
  '🐶',
  '🐺',
  '🦊',
  '🐵',
  '🐸',
  '🐯',
  '🦁',
  '🦓',
  '🦒',
  '🐴',
  '🐮',
  '🐷',
  '🐻',
  '🐼',
  '🐲',
  '🦄 ',
  '🐳',
  '🐬',
  '🐟',
  '🐠',
  '🐡',
  '🐙',
  '🦑',
  '🦐',
  '🦀',
  '🐚',
  '🐌',
  '🐅',
  '🐆',
  '🐘',
  '🦏',
  '🐂',
  '🐃',
  '🐄',
  '🐎',
  '🦌',
  '🐐',
  '🐏',
  '🐗',
  '🐪',
  '🦍',
  '🦖',
  '🦕',
  '🐈',
  '🐨',
  '🐿',
  '🦔',
  '🦇',
  '🐍',
  '🐋',
];
export const playerIcon = (addr = '') => {
  return icons[parseInt(addr.substr(3, 6), 16) % icons.length];
};

export function last<T>(arr: T[]): T {
  return arr[arr.length - 1];
}
