export type {
  PrintData,
  PrintTextData,
  PrintBarCodeData,
  PrintQRCodeData,
  PrintImageData,
  PrintTableData,
  PrintOptions,
  PrintPosition,
  PrintTableField,
  PrintType,
} from './models';
export { printer } from './printer';

// Re-export cashdrawer functions
export { PrinterStatus, PrinterType, PrinterErrorCodes } from '@devraghu/cashdrawer';
export type { DrawerOptions, OpenCashDrawerResult, PrinterInfo } from '@devraghu/cashdrawer';
