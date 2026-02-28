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

export interface PosPrintTableField {
  type: 'text' | 'image';
  value?: string;
  path?: string;
  style?: PrintDataStyle;

  // for type image
  width?: string;
  height?: string;
}

export interface PosPrintData {
  type: PosPrintType;
  value?: string;
  style?: PrintDataStyle;
  width?: string;
  height?: string;

  // for barcodes
  fontsize?: number;
  displayValue?: boolean;

  // for type image, barcode and qrCode; values: 'left'| 'center' | 'right'
  position?: PosPrintPosition;
  // image path
  path?: string;
  // image url or base64 object url
  url?: string;
  // specify the columns in table header, to be used with type table
  tableHeader?: PosPrintTableField[] | string[];
  //  specify the columns in table body, to be used with type table
  tableBody?: PosPrintTableField[][] | string[][];
  //  specify the columns in table footer, to be used with type table
  tableFooter?: PosPrintTableField[] | string[];
  // (type table), set custom style for table header
  tableHeaderStyle?: PrintDataStyle;
  // (type table), set custom style for table body
  tableBodyStyle?: PrintDataStyle;
  // (type table), set custom style for table footer
  tableFooterStyle?: PrintDataStyle;
}

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
