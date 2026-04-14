import type { Client, ClientPosition, Document, LineItem, Position, Sender } from './types';

type R = Record<string, unknown>;
const isObj = (v: unknown): v is R => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isNum = (v: unknown): v is number => typeof v === 'number' && !isNaN(v);
const isArr = Array.isArray;

const DOC_TYPES = ['invoice', 'offerte', 'mahnung', 'quittung'];

function isAccount(v: unknown): boolean {
  return isObj(v) && isStr(v.iban) && isStr(v.bank) && isStr(v.bic);
}

export function isSender(v: unknown): v is Sender {
  if (!isObj(v)) return false;
  if (!isStr(v.key) || v.key.length === 0) return false;
  if (!isStr(v.company) || !isStr(v.street) || !isStr(v.zip) || !isStr(v.city) || !isStr(v.country)) return false;
  if (!isStr(v.website) || !isStr(v.uid) || !isStr(v.contact) || !isStr(v.contactEmail)) return false;
  if (!isArr(v.accounts) || !v.accounts.every(isAccount)) return false;
  if (!isNum(v.invoiceDueDays) || !isNum(v.quoteValidDays)) return false;
  return true;
}

function isClientPosition(v: unknown): v is ClientPosition {
  return isObj(v) && isStr(v.positionId) && isNum(v.price);
}

export function isClient(v: unknown): v is Client {
  if (!isObj(v)) return false;
  if (!isStr(v.customerNumber) || v.customerNumber.length === 0) return false;
  if (!isStr(v.company) || !isStr(v.street) || !isStr(v.zip) || !isStr(v.city) || !isStr(v.country)) return false;
  if (v.positions !== undefined && (!isArr(v.positions) || !v.positions.every(isClientPosition))) return false;
  return true;
}

export function isPosition(v: unknown): v is Position {
  if (!isObj(v)) return false;
  return isStr(v.id) && isStr(v.description) && isStr(v.code) && isStr(v.unit) && isNum(v.defaultPrice);
}

function isLineItem(v: unknown): v is LineItem {
  if (!isObj(v)) return false;
  return isNum(v.pos) && isStr(v.description) && isStr(v.code) && isNum(v.quantity) && isStr(v.unit) && isNum(v.unitPrice);
}

export function isDocument(v: unknown): v is Document {
  if (!isObj(v)) return false;
  if (!isStr(v.number) || v.number.length === 0) return false;
  if (!isStr(v.type) || !DOC_TYPES.includes(v.type)) return false;
  if (!isStr(v.status)) return false;
  if (!isStr(v.subtitle)) return false;
  if (!isStr(v.customerNumber)) return false;
  if (!isObj(v.sender) || !isObj(v.recipient) || !isObj(v.meta)) return false;
  if (v.lineItems !== undefined && (!isArr(v.lineItems) || !v.lineItems.every(isLineItem))) return false;
  if (!isStr(v.createdAt) || !isStr(v.updatedAt)) return false;
  return true;
}
