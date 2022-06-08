import { DecodedImage } from './types';

const CONVERSION = 10;

/**
 * Decode the RLE image data into a format that's easier to consume in `buildSVG`.
 * @param image The RLE image data
 */
const decodeImage = (image: string): DecodedImage => {
  const data = image.replace(/^0x/, '');
  const paletteIndex = parseInt(data.substring(0, 2), 16);
  const bounds = {
    top: parseInt(data.substring(2, 4), 16),
    right: parseInt(data.substring(4, 6), 16),
    bottom: parseInt(data.substring(6, 8), 16),
    left: parseInt(data.substring(8, 10), 16),
  };
  const rects = data.substring(10);

  return {
    paletteIndex,
    bounds,
    rects:
      rects
        ?.match(/.{1,4}/g)
        ?.map(rect => [parseInt(rect.substring(0, 2), 16), parseInt(rect.substring(2, 4), 16)]) ??
      [],
  };
};

/**
 * Given RLE parts, palette colors, and a background color, build an SVG image.
 * @param parts The RLE part datas
 * @param paletteColors The hex palette colors
 * @param bgColor The hex background color
 */
export const buildSVG = (
  parts: { filename: string; data: string }[],
  paletteColors: string[],
  bgColor: string,
): string => {
  const svgWithoutEndTag = parts.reduce((result, part, idx) => {
    const svgRects: string[] = [];
    const { bounds, rects } = decodeImage(part.data);

    let currentX = bounds.left;
    let currentY = bounds.top;

    const isGlasses = part.filename.startsWith('glasses');

    // additional logic to build svg for circular glasses
    if (isGlasses) {
      const BRIDGE = 1;
      const FRAME_OFFSET = 2;

      const [length, colorIdx0] = rects[0];
      const [, colorIdx2] = rects[2];
      const [len5] = rects[5];
      const [, colorIdx10] = rects[10];
      const [, colorIdx14] = rects[14];
      const hexColor0 = paletteColors[colorIdx0];
      const hexColor2 = paletteColors[colorIdx2];
      const hexColor10 = paletteColors[colorIdx10];
      const radius = length / 2;

      // GLASSES FRAME: left eye frame, right eye frame, long frame, ear frame
      result += drawCircle(radius, currentX + radius, currentY + radius, hexColor0);
      result += drawRect(5 * radius + BRIDGE, 1, currentX, currentY + FRAME_OFFSET, hexColor0);
      result += drawCircle(radius, currentX + 3 * radius + BRIDGE, currentY + radius, hexColor2);
      result += drawRect(1, 2, currentX + 5 * radius, currentY + FRAME_OFFSET + 1, hexColor2);

      // ROUND EYES: all glasses apply except `square-fullblack` and `square-black-rgb`
      // len of 5th === 1 identifies fullblack, colorIdx14 === 90 identifies black-rgb
      if (len5 !== 1 && colorIdx14 !== 90) {
        // left eye (colored half, white half)
        result += drawPath(currentX + 3, currentY + 5, currentX + 3, currentY + 1, hexColor10);
        result += drawPath(currentX + 3, currentY + 1, currentX + 3, currentY + 5, 'FFFFFF');

        // right eye (colored half, white half)
        result += drawPath(currentX + 10, currentY + 5, currentX + 10, currentY + 1, hexColor10);
        result += drawPath(currentX + 10, currentY + 1, currentX + 10, currentY + 5, 'FFFFFF');

        return result;
      }
    }

    rects.forEach(rect => {
      const [length, colorIndex] = rect;
      const hexColor = paletteColors[colorIndex];

      // additional rect logic for square-black-rgb and square-fullblack glasses
      if (isGlasses && colorIndex !== 0 && hexColor !== '000000') {
        svgRects.push(drawRect(length, 1, currentX, currentY, hexColor));
      }

      // Do not push rect if transparent
      if (!isGlasses && colorIndex !== 0) {
        svgRects.push(drawRect(length, 1, currentX, currentY, hexColor));
      }

      currentX += length;
      if (currentX === bounds.right) {
        currentX = bounds.left;
        currentY++;
      }
    });
    result += svgRects.join('');
    return result;
  }, `<svg width="320" height="320" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#${bgColor}" />`);

  return `${svgWithoutEndTag}</svg>`;
};

const drawCircle = (r: number, cx: number, cy: number, fill: string) => {
  const v = [r, cx, cy].map(i => i * CONVERSION); // scale by 10
  return `<circle r="${v[0]}" cx="${v[1]}" cy="${v[2]}" fill="#${fill}" shape-rendering="geometricPrecision"/>`;
};

const drawRect = (w: number, h: number, x: number, y: number, fill: string) => {
  const v = [w, h, x, y].map(i => i * CONVERSION); // scale by 10
  return `<rect width="${v[0]}" height="${v[1]}" x="${v[2]}" y="${v[3]}" fill="#${fill}" />`;
};

const drawPath = (x1: number, y1: number, x2: number, y2: number, fill: string) => {
  const v = [x1, y1, x2, y2].map(i => i * CONVERSION); // scale by 10
  return `<path d="M${v[0]},${v[1]} A20,20 0 0 1 ${v[2]},${v[3]}" fill="#${fill}" shape-rendering="geometricPrecision"/>`;
};
