import type { PosPrintData, PrintDataStyle } from '../main/models';
import QRCode, { QRCodeRenderersOptions } from 'qrcode';
import DOMPurify from 'dompurify';

type PageElement = HTMLElement | HTMLDivElement | HTMLImageElement;

/**
 * Sanitize HTML string to prevent XSS attacks
 * Uses DOMPurify with a whitelist of safe tags for receipt printing
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'br', 'span', 'p', 'div'],
    ALLOWED_ATTR: ['style', 'class'],
  });
}
/**
 * @param arg {pass argument of type PosPrintData}
 * @description used for type text, used to generate type text
 * */
export function generatePageText(arg: PosPrintData): HTMLElement {
  const div = applyElementStyles(document.createElement('div'), arg.style!) as HTMLElement;
  div.innerHTML = sanitizeHtml(arg.value || '');

  return div;
}
/**
 * @param arg {pass argument of type PosPrintData}
 * @param type {string}
 * @description used for type text, used to generate type text
 * */
export function generateTableCell(arg: PosPrintData, type = 'td'): HTMLElement {
  const cellElement = applyElementStyles(document.createElement(type), {
    padding: '7px 2px',
    ...arg.style,
  });
  cellElement.innerHTML = sanitizeHtml(arg.value || '');

  return cellElement;
}
/**
 * @param arg {pass argument of type PosPrintData}
 * @description get image from path and return it as a html img
 * */
export function renderImageToPage(arg: PosPrintData): HTMLElement {
  const image_format = [
    'apng',
    'bmp',
    'gif',
    'ico',
    'cur',
    'jpeg',
    'jpg',
    'jpeg',
    'jfif',
    'pjpeg',
    'pjp',
    'png',
    'svg',
    'tif',
    'tiff',
    'webp',
  ];

  const img_con = applyElementStyles(document.createElement('div'), {
    width: '100%',
    display: 'flex',
    justifyContent: arg?.position || 'left',
  }) as HTMLDivElement;

  let uri: string | undefined;

  if (arg.url) {
    const isImageBase64 = isBase64(arg.url);
    if (!isValidHttpUrl(arg.url) && !isImageBase64) {
      throw new Error(`Invalid url: ${arg.url}`);
    }
    if (isImageBase64) {
      uri = 'data:image/png;base64,' + arg.url;
    } else {
      uri = arg.url;
    }
  } else if (arg.path) {
    // file must be read via preload API
    const result = window.electronAPI.readFileAsBase64(arg.path);
    if (!result.success) {
      throw new Error(result.error);
    }
    let ext = window.electronAPI.getFileExtension(arg.path);
    if (image_format.indexOf(ext) === -1) {
      throw new Error(ext + ' file type not supported, consider the types: ' + image_format.join());
    }
    if (ext === 'svg') {
      ext = 'svg+xml';
    }
    // insert image
    uri = 'data:image/' + ext + ';base64,' + result.data;
  } else {
    throw new Error('Image requires either a valid url or path property');
  }

  if (!uri) {
    throw new Error('Failed to generate image URI');
  }

  const img = applyElementStyles(document.createElement('img'), {
    height: arg.height,
    width: arg.width,
    ...arg.style,
  }) as HTMLImageElement;

  img.src = uri;

  // appending
  img_con.prepend(img);
  return img_con;
}

/**
 * @param str {string}
 * @description Checks if a string is a base64 string
 * */
export function isBase64(str: string): boolean {
  if (!str || typeof str !== 'string') {
    return false;
  }
  try {
    return btoa(atob(str)) === str;
  } catch (_e) {
    return false;
  }
}

/**
 * @param element {PageElement}
 * @param style {PrintDataStyle}
 * @description Apply styles to created elements on print web page.
 * */
export function applyElementStyles(element: PageElement, style: PrintDataStyle): PageElement {
  if (!style || typeof style !== 'object') {
    return element;
  }

  Object.assign(element.style, style);
  return element;
}

/**
 * @param url {string}
 * @description Checks is if a string is a valid URL
 * */
export function isValidHttpUrl(url: string) {
  let validURL;

  try {
    validURL = new URL(url);
  } catch (_) {
    return false;
  }

  return validURL.protocol === 'http:' || validURL.protocol === 'https:';
}

/**
 * @param elementId {string}
 * @param options {object}
 * @description Generate QR in page
 * */
export function generateQRCode(elementId: string, qrOptions: { value: string; width?: number }) {
  const { value, width = 1 } = qrOptions;

  const element = document.querySelector(`#${elementId}`) as HTMLCanvasElement;
  const canvasOptions: QRCodeRenderersOptions = {
    width,
    // height,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#000',
      light: '#fff',
    },
  };

  return QRCode.toCanvas(element, value, canvasOptions);
}
