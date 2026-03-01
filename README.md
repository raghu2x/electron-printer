![License](https://img.shields.io/npm/l/@devraghu/electron-printer)
![Version](https://img.shields.io/npm/v/@devraghu/electron-printer?label=version)
![downloads](https://img.shields.io/npm/dm/@devraghu/electron-printer)

# Electron Printer

An Electron.js plugin for thermal receipt printers and cash drawers. Supports 80mm, 78mm, 76mm, 58mm, 57mm, and 44mm printers with cash drawer integration.

**Requirements:** Electron >= 30.x.x

## Installation

```bash
npm install @devraghu/electron-printer
# or
yarn add @devraghu/electron-printer
```

## Quick Start

This library is designed for use in the **main process only**.

```js
const { printer } = require('@devraghu/electron-printer');

const options = {
  preview: false,
  margin: '0 0 0 0',
  copies: 1,
  printerName: 'XP-80C',
  timeOutPerLine: 400,
  pageSize: '80mm',
};

const data = [
  {
    type: 'text',
    value: 'SAMPLE HEADING',
    style: { fontWeight: '700', textAlign: 'center', fontSize: '24px' },
  },
  {
    type: 'barCode',
    value: '023456789010',
    height: 40,
    width: 2,
    displayValue: true,
    fontsize: 12,
  },
  {
    type: 'qrCode',
    value: 'https://example.com',
    height: 55,
    width: 55,
    style: { margin: '10px 20px' },
  },
];

printer
  .print(data, options)
  .then(() => console.log('Print successful'))
  .catch((error) => console.error(error));
```

> **Note:** If you need to trigger printing from the renderer process, use IPC to communicate with the main process.

## TypeScript Usage

```typescript
import { printer, type PrintData, type PrintOptions, type PrintResult } from '@devraghu/electron-printer';

const options: PrintOptions = {
  preview: false,
  margin: '0 0 0 0',
  copies: 1,
  printerName: 'XP-80C',
  timeOutPerLine: 400,
  pageSize: '80mm',
};

const data: PrintData[] = [
  {
    type: 'text',
    value: 'Hello World',
    style: { fontSize: '24px', textAlign: 'center' },
  },
];

printer
  .print(data, options)
  .then(() => console.log('Done'))
  .catch((error) => console.error(error));
```

## Print Options

| Option           | Type                         | Default        | Description                                                                                                                   |
| ---------------- | ---------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `printerName`    | `string`                     | System default | Printer device name                                                                                                           |
| `copies`         | `number`                     | `1`            | Number of copies to print                                                                                                     |
| `preview`        | `boolean`                    | `false`        | Show print preview window                                                                                                     |
| `pageSize`       | `PaperSize` \| `SizeOptions` | -              | Paper size: `'80mm'`, `'78mm'`, `'76mm'`, `'58mm'`, `'57mm'`, `'44mm'` or `{ width, height }` in pixels                       |
| `margin`         | `string`                     | `'0 0 0 0'`    | CSS margin values                                                                                                             |
| `width`          | `string`                     | -              | Width of page content                                                                                                         |
| `timeOutPerLine` | `number`                     | `400`          | Timeout per line in milliseconds                                                                                              |
| `silent`         | `boolean`                    | `true`         | Print without system dialogs                                                                                                  |
| `header`         | `string`                     | -              | Page header text                                                                                                              |
| `footer`         | `string`                     | -              | Page footer text                                                                                                              |
| `pathTemplate`   | `string`                     | Built-in       | Path to custom HTML template                                                                                                  |
| `landscape`      | `boolean`                    | `false`        | Landscape orientation                                                                                                         |
| `scaleFactor`    | `number`                     | -              | Scale factor of the web page                                                                                                  |
| `pagesPerSheet`  | `number`                     | -              | Pages per sheet                                                                                                               |
| `collate`        | `boolean`                    | -              | Collate pages                                                                                                                 |
| `pageRanges`     | `object[]`                   | -              | Page ranges to print ([Electron docs](https://www.electronjs.org/docs/latest/api/web-contents#contentsprintoptions-callback)) |
| `duplexMode`     | `string`                     | -              | Duplex mode ([Electron docs](https://www.electronjs.org/docs/latest/api/web-contents#contentsprintoptions-callback))          |
| `margins`        | `object`                     | -              | Page margins ([Electron docs](https://www.electronjs.org/docs/latest/api/web-contents#contentsprintoptions-callback))         |
| `dpi`            | `object`                     | -              | DPI settings ([Electron docs](https://www.electronjs.org/docs/latest/api/web-contents#contentsprintoptions-callback))         |

## Print Data Types

### Text

```js
{
  type: 'text',
  value: 'Your text here or <b>HTML</b>',
  style: { fontSize: "14px", textAlign: "center", fontWeight: "bold" }
}
```

### Barcode

```js
{
  type: 'barCode',
  value: '123456789012',
  height: 40,
  width: 2,
  displayValue: true,
  fontsize: 12,
  position: 'center'  // 'left' | 'center' | 'right'
}
```

### QR Code

```js
{
  type: 'qrCode',
  value: 'https://example.com',
  height: 55,
  width: 55,
  position: 'center',
  style: { margin: '10px' }
}
```

### Image

```js
{
  type: 'image',
  url: 'https://example.com/image.jpg',  // URL, local path, or base64
  width: '160px',
  height: '60px',
  position: 'center'
}
```

### Table

```js
{
  type: 'table',
  style: { border: '1px solid #ddd' },
  tableHeader: ['Item', 'Price'],
  tableBody: [
    ['Product A', '$10.00'],
    ['Product B', '$15.00']
  ],
  tableFooter: ['Total', '$25.00'],
  tableHeaderStyle: { backgroundColor: '#000', color: 'white' },
  tableBodyStyle: { border: '0.5px solid #ddd' },
  tableFooterStyle: { backgroundColor: '#000', color: 'white' }
}
```

### Table with Mixed Content

Tables can contain text and images in cells:

```js
{
  type: 'table',
  tableHeader: [
    { type: 'text', value: 'Name' },
    { type: 'text', value: 'Photo' }
  ],
  tableBody: [
    [
      { type: 'text', value: 'John' },
      { type: 'image', url: 'https://example.com/photo.jpg' }
    ]
  ]
}
```

## Print Data Properties

| Property           | Type                         | Description                                             |
| ------------------ | ---------------------------- | ------------------------------------------------------- |
| `type`             | `string`                     | `'text'`, `'qrCode'`, `'barCode'`, `'image'`, `'table'` |
| `value`            | `string`                     | Text content or barcode/QR value                        |
| `style`            | `object`                     | CSS styles (JSX syntax)                                 |
| `height`           | `number`                     | Height for barcodes and QR codes                        |
| `width`            | `number` \| `string`         | Width for images and barcodes                           |
| `displayValue`     | `boolean`                    | Show value below barcode                                |
| `position`         | `string`                     | `'left'`, `'center'`, `'right'`                         |
| `url`              | `string`                     | Image URL or base64 data                                |
| `path`             | `string`                     | Local file path for images                              |
| `fontsize`         | `number`                     | Font size for barcode text                              |
| `tableHeader`      | `string[]` \| `object[]`     | Table column headers                                    |
| `tableBody`        | `string[][]` \| `object[][]` | Table data rows                                         |
| `tableFooter`      | `string[]` \| `object[]`     | Table footer                                            |
| `tableHeaderStyle` | `object`                     | Header styling                                          |
| `tableBodyStyle`   | `object`                     | Body styling                                            |
| `tableFooterStyle` | `object`                     | Footer styling                                          |

## Additional Features

### Get Available Printers

Retrieve a list of all available printers on the system:

```typescript
import { printer } from '@devraghu/electron-printer';

const printers = printer.getPrinters();
console.log(printers);
// [{ name: 'XP-80C', isDefault: true, ... }, ...]
```

### Cash Drawer

Open a cash drawer connected to a thermal printer:

```typescript
import { printer } from '@devraghu/electron-printer';

// Open cash drawer on specific printer
printer
  .openCashDrawer('XP-80C')
  .then(() => console.log('Cash drawer opened'))
  .catch((error) => console.error('Failed to open cash drawer:', error));
```

---

## Project Structure

```
electron-printer/
├── src/
│   ├── main/
│   │   ├── index.ts          # Main exports
│   │   ├── printer.ts        # printer exports
│   │   ├── models.ts         # TypeScript interfaces
│   │   └── utils.ts          # Helper functions
│   ├── renderer/
│   │   ├── renderer.ts       # Content rendering
│   │   ├── utils.ts          # HTML generation
│   │   └── index.html        # Print template
│   └── preload/
│       └── preload.ts        # Preload script with API types
├── demo/                     # Demo application
├── test/                     # Playwright E2E tests
└── dist/                     # Compiled output
```

## Development

### Build

```bash
npm run build
```

### Run Demo

```bash
npm run demo
# or
npm start
```

### Run Tests

```bash
npm test
```
