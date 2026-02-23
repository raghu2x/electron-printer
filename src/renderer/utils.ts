import type { PosPrintData, PrintDataStyle } from '../main/models';
import QRCode, { QRCodeRenderersOptions } from 'qrcode';

type PageElement = HTMLElement | HTMLDivElement | HTMLImageElement;
/**
 * @param arg {pass argument of type PosPrintData}
 * @description used for type text, used to generate type text
 * */
export function generatePageText(arg: PosPrintData): HTMLElement {
  const div = applyElementStyles(document.createElement('div'), arg.style!) as HTMLElement;
  div.innerHTML = arg.value!;

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
  cellElement.innerHTML = arg.value!;

  return cellElement;
}
/**
 * @param arg {pass argument of type PosPrintData}
 * @description get image from path and return it as a html img
 * */
export function renderImageToPage(arg: PosPrintData): Promise<HTMLElement> {
  return new Promise(async (resolve, reject) => {
    // Check if string is a valid base64, if yes, send the file url directly
    let uri: string | undefined;

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

    if (arg.url) {
      const isImageBase64 = isBase64(arg.url);
      if (!isValidHttpUrl(arg.url) && !isImageBase64) {
        reject(`Invalid url: ${arg.url}`);
      }
      if (isImageBase64) {
        uri = 'data:image/png;base64,' + arg.url;
      } else {
        uri = arg.url;
      }
    } else if (arg.path) {
      // file must be read via preload API
      try {
        const result = await window.electronAPI.readFileAsBase64(arg.path);
        if (!result.success) {
          reject(new Error(result.error));
          return;
        }
        let ext = window.electronAPI.getFileExtension(arg.path);
        if (image_format.indexOf(ext) === -1) {
          reject(new Error(ext + ' file type not supported, consider the types: ' + image_format.join()));
          return;
        }
        if (ext === 'svg') {
          ext = 'svg+xml';
        }
        // insert image
        uri = 'data:image/' + ext + ';base64,' + result.data;
      } catch (e) {
        reject(e);
        return;
      }
    } else {
      reject(new Error('Image requires either a valid url or path property'));
      return;
    }

    if (!uri) {
      reject(new Error('Failed to generate image URI'));
      return;
    }

    const img = applyElementStyles(document.createElement('img'), {
      height: arg.height,
      width: arg.width,
      ...arg.style,
    }) as HTMLImageElement;

    img.src = uri;

    // appending
    img_con.prepend(img);
    resolve(img_con);
  });
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

  return new Promise((resolve, reject) => {
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

    QRCode.toCanvas(element, value, canvasOptions)
      .then(resolve)
      .catch((error: unknown) => {
        reject(error);
      });
  });
}
