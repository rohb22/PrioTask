export const colors = {
  bg:             '#000000',
  surface:        '#0F0F0F',
  surfaceRaised:  '#161616',
  border:         '#1F1F1F',
  textPrimary:    '#F0F0F0',
  textSecondary:  '#606060',
  textMuted:      '#303030',
  accent:         '#7B00CC',
  accentGlow:     'rgba(123,0,204,0.07)',
  success:        '#00C97A',
  danger:         '#C0392B',
  warning:        '#E9A800',
} as const;

export const typography = {
  taskTitle:    { fontSize: 17, fontWeight: '600' as const, color: colors.textPrimary },
  meta:         { fontSize: 12, color: colors.textSecondary },
  sectionLabel: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1, color: colors.textMuted },
  recommendation:{ fontSize: 12, fontStyle: 'italic' as const, color: '#404040' },
} as const;

export const radius = {
  card: 12,
  pill: 20,
} as const;