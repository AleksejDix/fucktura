import type { DocumentType } from '@/fs/types';

export const DOC_TYPE_DOT_CLASS: Record<DocumentType, string> = {
  quote: 'bg-amber-500',
  invoice: 'bg-emerald-500',
  reminder: 'bg-red-500',
  receipt: 'bg-blue-500',
};

export function defaultUnitForType(type: DocumentType): string {
  return type === 'receipt' ? 'Pauschal' : 'h';
}

/**
 * Document-number prefixes keep the original German initials (Rechnung,
 * Offerte, Mahnung, Quittung) so numbering stays continuous with documents
 * already issued.
 */
export function numberPrefix(type: DocumentType): string {
  return type === 'invoice' ? 'R' : type === 'quote' ? 'O' : type === 'reminder' ? 'M' : 'Q';
}
