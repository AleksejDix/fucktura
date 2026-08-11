export default {
  Loading: 'Loading...',
  Edit: 'Edit',
  Page: 'Page',

  // Sidebar
  Quotes: 'Quotes',
  Invoices: 'Invoices',
  Reminders: 'Reminders',
  Invoice: 'Invoice',
  Quote: 'Quote',
  Reminder: 'Reminder',
  Receipt: 'Receipt',
  'New quote': 'New Quote',
  'New invoice': 'New Invoice',
  'New reminder': 'New Reminder',
  'New receipt': 'New Receipt',
  Receipts: 'Receipts',
  'Convert to invoice': 'Convert to invoice',
  'All documents': 'All documents',
  Delete: 'Delete',
  'No documents': 'No documents',
  'Select client': 'Select client',

  // Settings
  Settings: 'Settings',
  'Company settings': 'Company settings',
  Company: 'Company',
  'Company name': 'Company name',
  Street: 'Street',
  ZIP: 'ZIP',
  City: 'City',
  Email: 'Email',
  Website: 'Website',
  UID: 'UID',
  'Client number': 'Client number',
  'Contact person': 'Contact person',
  Name: 'Name',
  'Payment terms': 'Payment terms',
  'Invoice due days': 'Invoice due (days)',
  'Quote valid days': 'Quote valid (days)',
  'Bank accounts': 'Bank accounts',
  'Add account': 'Add account',
  Bank: 'Bank',
  Remove: 'Remove',
  Save: 'Save',
  Saved: 'Saved',
  'Add sender': 'Add sender',
  'New sender': 'New sender',
  'No client': 'No client',
  'About Fucktura': 'About Fucktura',
  'About description': 'Create invoices, quotes, and reminders. Local, offline, no cloud.',
  File: 'File',
  Document: 'Document',
  View: 'View',
  'Print / PDF': 'Print / PDF',
  'Send email': 'Send email',
  'Edit mode': 'Edit mode',
  Clients: 'Clients',
  'New client': 'New client',
  Country: 'Country',
  Undo: 'Undo',
  Redo: 'Redo',
  Cut: 'Cut',
  Copy: 'Copy',
  Paste: 'Paste',
  'Select all': 'Select all',
  Positions: 'Positions',
  Description: 'Description',
  'Product code': 'Product code',
  Unit: 'Unit',
  Pos: 'Pos',
  Quantity: 'Quantity',
  'Unit price': 'Unit price',
  'Price in': 'Price in',
  'Add position': 'Add position',
  Position: 'Position',
  Price: 'Price',
  'Default price': 'Default price',
  'All positions assigned': 'All positions assigned',
  Window: 'Window',
  Minimize: 'Minimize',
  'Full screen': 'Full screen',
  Help: 'Help',
  'Fucktura Help': 'Fucktura Help',
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  accepted: 'Accepted',
  rejected: 'Rejected',
  settled: 'Settled',

  // Folder gate
  'Browser not supported — please use Chrome, Edge, Brave, or another Chromium-based browser.':
    'Browser not supported — please use Chrome, Edge, Brave, or another Chromium-based browser.',
  'File System Access API required': 'File System Access API required',
  'This app stores your invoices as real files on your disk. It needs the File System Access API, which is only available in Chromium-based browsers.':
    'This app stores your invoices as real files on your disk. It needs the File System Access API, which is only available in Chromium-based browsers.',
  'Choose a folder': 'Choose a folder',
  'Your invoices, clients, and positions will be saved as JSON files in the folder you pick. You can open them in Finder, back them up, or sync them via iCloud or Dropbox.':
    'Your invoices, clients, and positions will be saved as JSON files in the folder you pick. You can open them in Finder, back them up, or sync them via iCloud or Dropbox.',
  'Pick folder': 'Pick folder',
  'Loading…': 'Loading…',
  'Open Folder…': 'Open Folder…',
  'Recent folders': 'Recent folders',
  'Clear recent folders': 'Clear recent folders',
  'Current folder': 'Current folder',
  'Change…': 'Change…',

  // Edit menu
  'Find document…': 'Find document…',
  Duplicate: 'Duplicate',
  'Add line item': 'Add line item',
  'Clear line items': 'Clear line items',
  'Reset recipient': 'Reset recipient',

  // Document menu
  'Next document': 'Next document',
  'Previous document': 'Previous document',
  documents: 'documents',

  // VAT
  VAT: 'VAT',
  'Subtotal (net)': 'Subtotal (net)',
  Total: 'Total',
  on: 'on',
  Exempt: 'Exempt',
  'Amount (tax exempt)': 'Amount (tax exempt)',
  'Quote amount (tax exempt)': 'Quote amount (tax exempt)',
  'VAT registered': 'VAT registered',
  'VAT registered hint': 'Show VAT column and breakdown on invoices.',
  'VAT %': 'VAT %',
  'Tax note': 'Tax note',
  'Tax note hint': 'Printed below the invoice total, e.g. a small-business VAT exemption note.',
  auto: 'auto',

  // Seeding
  'Seed demo data question': 'This folder is empty. Start with demo data to explore the app?',
  'Load demo data': 'Load demo data',
  'Not saved': 'Not saved',

  // Load problems
  'Unreadable files': '{count} file(s) could not be read and are not shown',
  'Unreadable files hint':
    'Fix the file in your data folder; the app reloads when the window regains focus.',
  'Invalid JSON': 'Invalid JSON',
  'Unexpected shape': 'Unexpected shape',
  Dismiss: 'Dismiss',

  // Error boundary
  'Something went wrong': 'Something went wrong',
  Retry: 'Retry',
  Details: 'Details',

  // Filtering
  Sender: 'Sender',
  'All senders': 'All senders',
  Recipient: 'Recipient',
  'All recipients': 'All recipients',
  Type: 'Type',
  'All types': 'All types',
  Status: 'Status',
  'Any status': 'Any status',

  // Collections sidebar
  Types: 'Types',
  Senders: 'Senders',
  Recipients: 'Recipients',
  Overdue: 'Overdue',
  Unpaid: 'Unpaid',
  'Quick search': 'Quick search',

  // Confirmations
  Cancel: 'Cancel',
  'Delete document confirm': 'Delete document {number}? This removes the file from disk.',
  'Delete client confirm': 'Delete client {name}? Existing documents are kept.',
  'Delete sender confirm': 'Delete sender {name}?',
  'Delete position confirm': 'Delete position {name}?',

  // Service worker
  'Update available · Reload': 'Update available · Reload',

  // Outgoing emails (see src/emails/index.ts for the parameters)
  'Email subject label': `Subject`,
  'Quote email': `Dear {name}

Please find attached our quote {number} dated {date}.

Quote amount: {currency} {total}
Valid until: {validUntil}

{subjectBlock}Please do not hesitate to contact us if you have any questions.

Kind regards
{signature}`,
  'Invoice email': `Dear {name}

Please find attached our invoice {number} dated {date}.

Invoice amount: {currency} {total}
Due date: {dueDate}

{subjectBlock}Please do not hesitate to contact us if you have any questions.

Kind regards
{signature}`,
  'Reminder email': `Dear {name}

May we kindly remind you of the outstanding invoice {invoiceRef} dated {invoiceDate}. According to our records we have not yet received payment.

Outstanding amount incl. reminder fee and default interest: {currency} {total}
Overdue since: {overdueSince}
Due date: {dueDate}

Please find the reminder with all details and payment information attached. We kindly ask you to settle the outstanding amount within the stated deadline. Should your payment have crossed this message, please disregard this reminder.

Kind regards
{signature}`,
  'Receipt email': `Dear {name}

Please find attached our receipt {number} dated {date}.

Amount: {currency} {total} (already paid)

{subjectBlock}Please do not hesitate to contact us if you have any questions.

Kind regards
{signature}`,
};
