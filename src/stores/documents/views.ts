import type { Document, DocumentStatus, ViewId } from '@/fs/types';

/**
 * Pure predicates behind the mail-style smart views in the sidebar.
 * Anything that needs store state (sender resolution, mahnung settlement)
 * is injected via ViewContext so this module stays free of refs.
 */

export interface ViewContext {
  isOverdue(doc: Document): boolean;
  senderKeyOf(doc: Document): string | null;
}

export function recipientLabel(doc: Document): string {
  return doc.recipient.company || doc.recipient.name || '';
}

export function isOverdue(doc: Document, isMahnungResolved: (d: Document) => boolean): boolean {
  if (doc.type === 'invoice' && doc.status === 'paid') return false;
  if (doc.type === 'mahnung' && isMahnungResolved(doc)) return false;
  if (doc.type === 'offerte' && (doc.status === 'accepted' || doc.status === 'rejected'))
    return false;
  const due =
    doc.type === 'invoice'
      ? doc.meta.dueDate
      : doc.type === 'offerte'
        ? doc.meta.validUntil
        : doc.type === 'mahnung'
          ? doc.meta.overdueSince
          : null;
  if (!due) return false;
  const d = new Date(due);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

export function viewMatches(doc: Document, view: ViewId, ctx: ViewContext): boolean {
  if (view === 'all') return true;
  if (view === 'drafts') return doc.status === 'draft';
  if (view === 'overdue') return ctx.isOverdue(doc);
  if (view === 'unpaid') return doc.type === 'invoice' && doc.status !== 'paid';
  if (view.startsWith('type:')) return doc.type === view.slice(5);
  if (view.startsWith('sender:')) return ctx.senderKeyOf(doc) === view.slice(7);
  if (view.startsWith('recipient:')) return recipientLabel(doc) === view.slice(10);
  return true;
}

/** Status pills that make sense for the current view. */
export function statusPillsForView(view: ViewId): DocumentStatus[] {
  if (view === 'drafts' || view === 'overdue' || view === 'unpaid') return [];
  if (view === 'type:offerte') return ['draft', 'sent', 'accepted', 'rejected'];
  if (view === 'type:invoice') return ['draft', 'sent', 'paid'];
  if (view === 'type:mahnung') return ['draft', 'sent'];
  if (view === 'type:quittung') return [];
  return ['draft', 'sent', 'paid', 'accepted', 'rejected'];
}
