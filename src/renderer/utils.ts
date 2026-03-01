import type { PrintTextData, PrintImageData, PrintDataStyle } from '../main/models';
import DOMPurify from 'dompurify';

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
export function applyElementStyles<T extends HTMLElement>(element: T, style: PrintDataStyle = {}): T {
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
 * Creates a text element from PrintTextData
 * @param textData - print data containing text value and style
 */
export function createTextElement(textData: PrintTextData): HTMLDivElement {
  const div = applyElementStyles(document.createElement('div'), textData.style);
  div.innerHTML = sanitizeHtml(textData.value || '');

  return div;
}

/**
 * Creates a table cell element (th or td)
 * @param cellData - print data containing cell value and style
 * @param cellType - cell type, either 'th' or 'td'
 */
export function createTableCell(cellData: PrintTextData, cellType: 'th' | 'td' = 'td'): HTMLElement {
  const cellElement = applyElementStyles(document.createElement(cellType), {
    padding: '7px 2px',
    ...cellData.style,
  });
  cellElement.innerHTML = sanitizeHtml(cellData.value || '');

  return cellElement;
}

/**
 * Creates an image element from PrintImageData
 * @param imageData - print data containing image path/url and dimensions
 */
export function createImageElement(imageData: PrintImageData): HTMLElement {
  const imgContainer = applyElementStyles(document.createElement('div'), {
    width: '100%',
    display: 'flex',
    justifyContent: imageData.position || 'left',
  });

  let uri: string | undefined;

  if (imageData.url) {
    const isImageBase64 = isBase64(imageData.url);
    if (!isValidHttpUrl(imageData.url) && !isImageBase64) {
      throw new Error(`Invalid url: ${imageData.url}`);
    }
    if (isImageBase64) {
      uri = 'data:image/png;base64,' + imageData.url;
    } else {
      uri = imageData.url;
    }
  } else if (imageData.path) {
    // file must be read via preload API
    const result = window.electronAPI.readFileAsBase64(imageData.path);
    if (!result.success) {
      throw new Error(result.error);
    }
    let ext = window.electronAPI.getFileExtension(imageData.path);
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
    height: imageData.height,
    width: imageData.width,
    ...imageData.style,
  });

  img.src = uri;

  // appending
  imgContainer.prepend(img);
  return imgContainer;
}
