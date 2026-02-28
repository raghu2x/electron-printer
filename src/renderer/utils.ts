import type { PosPrintTextData, PosPrintImageData, PrintDataStyle } from '../main/models';
import QRCode, { QRCodeRenderersOptions } from 'qrcode';
import DOMPurify from 'dompurify';

type PageElement = HTMLElement | HTMLDivElement | HTMLImageElement;

/** Supported image formats for rendering */
const IMAGE_SUPPORTED_FORMATS = new Set([
  'apng',
  'bmp',
  'gif',
  'ico',
  'cur',
  'jpeg',
  'jpg',
  'jfif',
  'pjpeg',
  'pjp',
  'png',
  'svg',
  'tif',
  'tiff',
  'webp',
]);

/**
 * Apply styles to created elements on print web page
 * @param element - the DOM element to style
 * @param style - CSS styles to apply
 */
export function applyElementStyles(element: PageElement, style: PrintDataStyle = {}): PageElement {
  if (!style || typeof style !== 'object') {
    return element;
  }

  Object.assign(element.style, style);
  return element;
}

/**
 * Checks if a string is a base64 string
 * @param str - the string to check
 */
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
 * Checks if a string is a valid URL
 * @param url - the URL string to validate
 */
export function isValidHttpUrl(url: string): boolean {
  let validURL;

  try {
    validURL = new URL(url);
  } catch (_) {
    return false;
  }

  return validURL.protocol === 'http:' || validURL.protocol === 'https:';
}

/**
 * Sanitize HTML string to prevent XSS attacks
 * @param html - the HTML string to sanitize
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'br', 'span', 'p', 'div'],
    ALLOWED_ATTR: ['style', 'class'],
  });
}
/**
 * Generates a text element from PosPrintTextData
 * @param arg - print data containing text value and style
 */
export function generatePageText(arg: PosPrintTextData): HTMLElement {
  const div = applyElementStyles(document.createElement('div'), arg.style) as HTMLElement;
  div.innerHTML = sanitizeHtml(arg.value || '');

  return div;
}
/**
 * Generates a table cell element (th or td)
 * @param arg - print data containing cell value and style
 * @param type - cell type, either 'th' or 'td'
 */
export function generateTableCell(arg: PosPrintTextData, type: 'th' | 'td' = 'td'): HTMLElement {
  const cellElement = applyElementStyles(document.createElement(type), {
    padding: '7px 2px',
    ...arg.style,
  });
  cellElement.innerHTML = sanitizeHtml(arg.value || '');

  return cellElement;
}
/**
 * Gets image from path or url and returns it as an HTML img element
 * @param arg - print data containing image path/url and dimensions
 */
export function renderImageToPage(arg: PosPrintImageData): HTMLElement {
  const imgContainer = applyElementStyles(document.createElement('div'), {
    width: '100%',
    display: 'flex',
    justifyContent: arg.position || 'left',
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
    if (!IMAGE_SUPPORTED_FORMATS.has(ext)) {
      throw new Error(ext + ' file type not supported, consider the types: ' + [...IMAGE_SUPPORTED_FORMATS].join());
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
  imgContainer.prepend(img);
  return imgContainer;
}

/**
 * Generates QR code on a canvas element
 * @param elementId - the canvas element ID to render QR code on
 * @param qrOptions - QR code value and width settings
 */
export function generateQRCode(elementId: string, qrOptions: { value: string; width: number }): Promise<void> {
  const { value, width } = qrOptions;

  const element = document.querySelector(`#${elementId}`) as HTMLCanvasElement;
  const canvasOptions: QRCodeRenderersOptions = {
    width,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#000',
      light: '#fff',
    },
  };

  return QRCode.toCanvas(element, value, canvasOptions);
}
