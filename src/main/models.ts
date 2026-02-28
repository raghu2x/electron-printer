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
export interface PosPrintOptions extends Omit<WebContentsPrintOptions, 'pageSize' | 'deviceName' | 'dpi'> {
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
export declare type PosPrintPosition = 'left' | 'center' | 'right';

export type PosPrintTableField = PosPrintImageData | PosPrintTextData;

/** Base properties shared by all print data types */
interface PosPrintDataBase {
  style?: PrintDataStyle;
}

/** Text content for printing */
export interface PosPrintTextData extends PosPrintDataBase {
  type: 'text';
  value: string;
}

/** Barcode content for printing */
export interface PosPrintBarCodeData extends PosPrintDataBase {
  type: 'barCode';
  value: string;
  width?: string;
  height?: string;
  fontsize?: number;
  displayValue?: boolean;
  position?: PosPrintPosition;
}

/** QR code content for printing */
export interface PosPrintQRCodeData extends PosPrintDataBase {
  type: 'qrCode';
  value: string;
  width?: string;
  position?: PosPrintPosition;
}

/** Image content for printing */
export interface PosPrintImageData extends PosPrintDataBase {
  type: 'image';
  path?: string;
  url?: string;
  width?: string;
  height?: string;
  position?: PosPrintPosition;
}

/** Table content for printing */
export interface PosPrintTableData extends PosPrintDataBase {
  type: 'table';
  tableHeader?: PosPrintTableField[] | string[];
  tableBody?: PosPrintTableField[][] | string[][];
  tableFooter?: PosPrintTableField[] | string[];
  tableHeaderStyle?: PrintDataStyle;
  tableBodyStyle?: PrintDataStyle;
  tableFooterStyle?: PrintDataStyle;
}

/** Discriminated union of all print data types */
export type PosPrintData =
  | PosPrintTextData
  | PosPrintBarCodeData
  | PosPrintQRCodeData
  | PosPrintImageData
  | PosPrintTableData;

export declare type PosPrintType = 'text' | 'barCode' | 'qrCode' | 'image' | 'table';

/**
 * CSS Style interface - a subset of CSSStyleDeclaration properties commonly used for printing
 * Uses Record type for flexibility while maintaining type safety
 */
export type PrintDataStyle = {
  [K in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[K];
};

export interface PrintResult {
  complete: boolean;
  data?: PosPrintData[];
  options?: PosPrintOptions;
}

export interface IpcMsgReplyResult {
  status: boolean;
  error: string | null;
}
