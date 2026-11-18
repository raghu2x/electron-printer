const REPO_URL = 'https://github.com/raghu2x/electron-printer';

const divider = { type: 'text', value: '', style: { borderTop: '1px dashed #000', margin: '8px 0' } };

const inverted = { backgroundColor: '#000', color: '#fff' };

/**
 * Sample receipts for the demo. Each `build` receives the absolute path of the demo logo,
 * so the samples print without any network access.
 */
export const SAMPLES = [
  {
    id: 'store',
    label: 'Store receipt',
    build: (logoPath) => [
      { type: 'image', path: logoPath, position: 'center', width: '56px', height: '56px' },
      { type: 'text', value: 'CORNER STORE', style: { fontWeight: '700', textAlign: 'center', fontSize: '20px' } },
      { type: 'text', value: '12 Market Street<br>Tel 555-0142', style: { textAlign: 'center', fontSize: '11px' } },
      divider,
      { type: 'text', value: 'Receipt #000482 &middot; 18 Nov 2026 14:32', style: { fontSize: '11px' } },
      {
        type: 'table',
        tableHeader: ['Item', 'Qty', 'Price'],
        tableBody: [
          ['Flat white', '2', '7.00'],
          ['Almond croissant', '1', '4.20'],
          ['Sourdough loaf', '1', '6.50'],
          ['Oat milk 1L', '2', '5.70'],
        ],
        tableFooter: ['Total', '6', '23.40'],
        tableHeaderStyle: inverted,
        tableBodyStyle: { borderBottom: '0.5px solid #ddd' },
        tableFooterStyle: { fontWeight: '700' },
      },
      { type: 'text', value: 'Paid by card', style: { textAlign: 'right', fontSize: '11px' } },
      divider,
      { type: 'barCode', value: '000482181126', height: 40, width: 2, displayValue: true, fontsize: 12 },
      { type: 'qrCode', value: REPO_URL, width: 90, position: 'center' },
      { type: 'text', value: 'Thank you, see you again!', style: { textAlign: 'center', fontSize: '12px' } },
    ],
  },
  {
    id: 'elements',
    label: 'Every element type',
    build: (logoPath) => [
      { type: 'text', value: 'TEXT', style: { fontWeight: '700', fontSize: '18px', textAlign: 'center' } },
      {
        type: 'text',
        value: 'Underlined, small and centred',
        style: { textDecoration: 'underline', fontSize: '10px', textAlign: 'center' },
      },
      { type: 'text', value: 'Inline <b>bold</b> and <i>italic</i> HTML' },
      divider,
      { type: 'image', path: logoPath, position: 'left', width: '40px', height: '40px' },
      { type: 'image', path: logoPath, position: 'right', width: '40px', height: '40px' },
      divider,
      { type: 'barCode', value: '023456789010', height: 40, width: 2, displayValue: true, fontsize: 12 },
      { type: 'qrCode', value: REPO_URL, width: 80, position: 'right' },
      divider,
      {
        type: 'table',
        style: { border: '1px solid #ddd' },
        tableHeader: [
          { type: 'text', value: 'Label' },
          { type: 'text', value: 'Image' },
        ],
        tableBody: [
          [
            { type: 'text', value: 'Typed cells' },
            { type: 'image', path: logoPath, width: '28px', height: '28px' },
          ],
        ],
        tableFooter: ['Footer', 'Plain string'],
        tableHeaderStyle: inverted,
        tableBodyStyle: { border: '0.5px solid #ddd' },
        tableFooterStyle: inverted,
      },
    ],
  },
  {
    id: 'codes',
    label: 'Barcode and QR code',
    build: () => [
      { type: 'text', value: 'Barcode', style: { fontWeight: '700', textAlign: 'center' } },
      { type: 'barCode', value: '023456789010', height: 50, width: 2, displayValue: true, fontsize: 12 },
      { type: 'text', value: 'QR code: left, centre, right', style: { fontWeight: '700', textAlign: 'center' } },
      { type: 'qrCode', value: 'left', width: 60, position: 'left' },
      { type: 'qrCode', value: 'center', width: 60, position: 'center' },
      { type: 'qrCode', value: 'right', width: 60, position: 'right' },
    ],
  },
];
