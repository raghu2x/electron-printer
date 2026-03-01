import type { WebContentsPrintOptions } from 'electron';

export declare type PaperSize = '80mm' | '78mm' | '76mm' | '57mm' | '58mm' | '44mm';

export interface SizeOptions {
  height: number;
  width: number;
}

/**
 * Print options
 * @see https://www.electronjs.org/docs/latest/api/web-contents#contentsprintoptions-callback
 */
export interface PrintOptions extends Omit<WebContentsPrintOptions, 'pageSize' | 'deviceName' | 'dpi'> {
  // width of page and body
  width?: string;
  margin?: string;

  /** false=print，true=pop preview window */
  preview?: boolean;
  printerName?: string;
  /** Timeout，actual time is ：data.length * timeoutPerLine ms */
  timeOutPerLine?: number;
  pageSize?: PaperSize | SizeOptions;
  dpi?: { horizontal: number; vertical: number };
  /** Path to HTML file for custom print options */
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
