import type { Document } from '@/fs/types';

/** Concatenates the searchable fields of a document into a lowercased haystack. */
export function documentHaystack(d: Document): string {
  return [
    d.number,
    d.subtitle,
    d.recipient.company,
    d.recipient.name,
    d.customerNumber,
    d.meta.customerNumber,
  ]
    .join(' ')
    .toLowerCase();
}
