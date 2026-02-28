export type {
  PosPrintData,
  PosPrintTextData,
  PosPrintBarCodeData,
  PosPrintQRCodeData,
  PosPrintImageData,
  PosPrintTableData,
  PosPrintOptions,
  PosPrintPosition,
  PosPrintTableField,
  PosPrintType,
} from './models';
export { posPrinter } from './pos-printer';

// Re-export cashdrawer functions
export { PrinterStatus, PrinterType, PrinterErrorCodes } from '@devraghu/cashdrawer';
export type { DrawerOptions, OpenCashDrawerResult, PrinterInfo } from '@devraghu/cashdrawer';
