import type { WebContentsPrintOptions } from 'electron';

export declare type PaperSize = '80mm' | '78mm' | '76mm' | '57mm' | '58mm' | '44mm';

export interface SizeOptions {
  height: number;
  width: number;
}

/**
 * Print configuration options.
 *
 * Extends Electron's WebContentsPrintOptions with additional properties for receipt printing.
 * Inherited options include: silent, printBackground, copies, header, footer, color,
 * margins, landscape, scaleFactor, pagesPerSheet, collate, pageRanges, duplexMode.
 *
 * @see https://www.electronjs.org/docs/latest/api/web-contents#contentsprintoptions-callback
 */
export interface PrintOptions extends Omit<WebContentsPrintOptions, 'pageSize' | 'deviceName' | 'dpi'> {
  /**
   * CSS width of the print container element.
   * @example "100%", "80mm", "300px"
   */
  width?: string;

  /**
   * CSS margin of the print container element.
   * @example "0", "10px", "5mm 10mm"
   */
  margin?: string;

  /**
   * When true, opens a preview window instead of printing directly.
   * @default false
   */
  preview?: boolean;

  /**
   * Name of the target printer. Required unless `silent` or `preview` is true.
   * Use `getPrinters()` to get available printer names.
   */
  printerName?: string;

  /**
   * Timeout per print item in milliseconds.
   * Total timeout is calculated as: `data.length * timeOutPerLine + 200ms`.
   * Used to prevent hanging when printer is disconnected.
   * @default 400
   */
  timeOutPerLine?: number;

  /**
   * Paper size for printing. Can be a preset size string or custom dimensions.
   * @example "80mm", "58mm", { width: 300, height: 400 }
   */
  pageSize?: PaperSize | SizeOptions;

  /**
   * Print resolution in dots per inch.
   * @example { horizontal: 300, vertical: 300 }
   */
  dpi?: { horizontal: number; vertical: number };

  /**
   * Path to a custom HTML template file for the print window.
   * If not provided, uses the default built-in template.
   */
  pathTemplate?: string;
}

/** Alignment for barCode and qrCode */
export declare type PrintPosition = 'left' | 'center' | 'right';

export type PrintTableField = PrintImageData | PrintTextData;

/** Base properties shared by all print data types */
interface PrintDataBase {
  style?: PrintDataStyle;
}

/** Text content for printing */
export interface PrintTextData extends PrintDataBase {
  type: 'text';
  value: string;
}

/** Barcode content for printing */
export interface PrintBarCodeData extends PrintDataBase {
  type: 'barCode';
  value: string;
  width?: string;
  height?: string;
  fontsize?: number;
  displayValue?: boolean;
  position?: PrintPosition;
}

/** QR code content for printing */
export interface PrintQRCodeData extends PrintDataBase {
  type: 'qrCode';
  value: string;
  width?: string;
  position?: PrintPosition;
}

/** Image content for printing */
export interface PrintImageData extends PrintDataBase {
  type: 'image';
  path?: string;
  url?: string;
  width?: string;
  height?: string;
  position?: PrintPosition;
}

/** Table content for printing */
export interface PrintTableData extends PrintDataBase {
  type: 'table';
  tableHeader?: PrintTableField[] | string[];
  tableBody?: PrintTableField[][] | string[][];
  tableFooter?: PrintTableField[] | string[];
  tableHeaderStyle?: PrintDataStyle;
  tableBodyStyle?: PrintDataStyle;
  tableFooterStyle?: PrintDataStyle;
}

/** Discriminated union of all print data types */
export type PrintData = PrintTextData | PrintBarCodeData | PrintQRCodeData | PrintImageData | PrintTableData;

export declare type PrintType = 'text' | 'barCode' | 'qrCode' | 'image' | 'table';

/**
 * CSS Style interface - a subset of CSSStyleDeclaration properties commonly used for printing
 * Uses Record type for flexibility while maintaining type safety
 */
export type PrintDataStyle = {
  [K in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[K];
};

export interface PrintResult {
  complete: boolean;
  data?: PrintData[];
  options?: PrintOptions;
}

export interface IpcMsgReplyResult {
  status: boolean;
  error: string | null;
}
