/** Etiquetas de clasificación (formato 2 grupos, 3 clasifican) */
export function getQualificationBadge(position: number): {
  label: string;
  color: 'gold' | 'green' | 'amber' | 'slate';
} | null {
  if (position === 1) {
    return { label: 'Semifinal directa', color: 'gold' };
  }
  if (position === 2 || position === 3) {
    return { label: 'Fase previa', color: 'amber' };
  }
  return null;
}
