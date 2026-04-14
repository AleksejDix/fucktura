import type { DocumentType } from '@/fs/types';

export const DOC_TYPE_DOT_CLASS: Record<DocumentType, string> = {
  offerte: 'bg-amber-500',
  invoice: 'bg-emerald-500',
  mahnung: 'bg-red-500',
  quittung: 'bg-blue-500',
};

export function defaultUnitForType(type: DocumentType): string {
  return type === 'quittung' ? 'Pauschal' : 'h';
}

export function numberPrefix(type: DocumentType): string {
  return type === 'invoice' ? 'R' : type === 'offerte' ? 'O' : type === 'mahnung' ? 'M' : 'Q';
}
