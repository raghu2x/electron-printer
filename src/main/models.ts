export declare type PageSize = 'A3' | 'A4' | 'A5' | 'Legal' | 'Letter' | 'Tabloid';

export declare type PaperSize = '80mm' | '78mm' | '76mm' | '57mm' | '58mm' | '44mm';

export interface SizeOptions {
  height: number;
  width: number;
}

/**
 * @description Print options
 * {@link https://www.electronjs.org/docs/latest/api/web-contents#contentsprintoptions-callback}
 * @field copies: number of copies to print
 * @field preview: bool，false=print，true=pop preview window
 * @field deviceName: string，default device name, check it at webContent.getPrinters()
 * @field timeoutPerLine: int，timeout，actual time is ：data.length * timeoutPerLine ms
 * @field silent: To print silently
 * @field pathTemplate: Path to HTML file for custom print options
 */
export interface PosPrintOptions {
  header?: string;
  // width of page and body
  width?: string | number;
  footer?: string;
  copies?: number;
  preview?: boolean;
  printerName?: string;
  margin?: string;
  timeOutPerLine?: number;
  silent?: boolean;
  color?: boolean;
  printBackground?: boolean;
  margins?: {
    marginType?: 'default' | 'none' | 'printableArea' | 'custom';
    top?: number;
    bottom?: number;
    right?: number;
    left?: number;
  };
  landscape?: boolean;
  scaleFactor?: number;
  pagesPerSheet?: number;
  collate?: boolean;
  pageRanges?: { from: number; to: number }[];
  duplexMode?: 'simplex' | 'shortEdge' | 'longEdge';
  pageSize?: PaperSize | SizeOptions;
  dpi?: { horizontal: number; vertical: number };
  pathTemplate?: string;
}

export interface SizeOptions {
  height: number;
  width: number;
}
/**
 * @type PosPrintPosition
 * @description Alignment for type barCode and qrCode
 *
 */
export declare type PosPrintPosition = 'left' | 'center' | 'right';
/**
 * @interface
 * @name PosPrintTableField
 * */
export interface PosPrintTableField {
  type: 'text' | 'image';
  value?: string;
  path?: string;
  style?: PrintDataStyle;

  // for type image
  width?: string;
  height?: string;
}

/**
 * @interface
 * @name PosPrintData
 * **/
export interface PosPrintData {
  /**
   * @property type
   * @description type data to print: 'text' | 'barCode' | 'qrcode' | 'image' | 'table'
   */
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
/**
 * @type PosPrintType
 * @name PosPrintType
 * **/
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
