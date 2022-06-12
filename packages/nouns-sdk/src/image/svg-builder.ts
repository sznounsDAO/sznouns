import { DecodedImage, DecodedGlasses } from './types';

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
 * Decode the RLE glasses image data into a format that's easier to consume in `buildSVG`.
 * @param image The RLE glasses image data
 */
const decodeGlasses = (image: string): DecodedGlasses => {
  const data = image.replace(/^0x/, '');
  const paletteIndex = parseInt(data.substring(0, 2), 16);
  const isHalfMoon = parseInt(data.substring(2, 4), 16);
  const newData = data.slice(4);
  const shapes =
    newData
      .match(/.{1,10}/g)
      ?.map(shape => (shape.match(/.{1,2}/g) ?? []).map(data => parseInt(data, 16))) ?? [];
  return { paletteIndex, isHalfMoon, shapes };
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
  const svgWithoutEndTag = parts.reduce((result, part) => {
    const isGlasses = part.filename.startsWith('glasses');

    if (isGlasses) {
      const { isHalfMoon, shapes } = decodeGlasses(part.data);
      shapes.forEach((shape, idx) => {
        if (idx < 2) {
          result += drawRect(shape.slice(1), paletteColors[shape[0]]);
        } else if (idx < 4) {
          result += drawCircle(shape.slice(1), paletteColors[shape[0]]);
        } else {
          if (isHalfMoon) {
            result += drawPath(shape.slice(1), paletteColors[shape[0]]);
          } else {
            result += drawRect(shape.slice(1), paletteColors[shape[0]]);
          }
        }
      });
    }

    const svgRects: string[] = [];
    const { bounds, rects } = decodeImage(part.data);

    let currentX = bounds.left;
    let currentY = bounds.top;

    rects.forEach(rect => {
      const [length, colorIndex] = rect;
      const hexColor = paletteColors[colorIndex];

      if (!isGlasses && colorIndex !== 0)
        svgRects.push(drawRect([length, 1, currentX, currentY], hexColor));

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

/**
 * Given shape params, construct an svg string for a circle.
 * @param params Circle svg parameters: radius, centerX, centerY, fill
 */
const drawCircle = (params: number[], fill: string) => {
  const v = params.map(i => i * CONVERSION);
  return `<circle r="${v[0]}" cx="${v[1]}" cy="${v[2]}" fill="#${fill}" shape-rendering="geometricPrecision"/>`;
};

/**
 * Given shape params, construct an svg string for a rectangle.
 * @param params Rect svg parameters: width, height, x, y, fill
 */
const drawRect = (params: number[], fill: string) => {
  const v = params.map(i => i * CONVERSION);
  return `<rect width="${v[0]}" height="${v[1]}" x="${v[2]}" y="${v[3]}" fill="#${fill}" />`;
};

/**
 * Given shape params, construct an svg string for a path.
 * @param params Path svg parameters: starting point coord, dest point coord, fill
 */
const drawPath = (params: number[], fill: string) => {
  const v = params.map(i => i * CONVERSION);
  return `<path d="M${v[0]},${v[1]} A20,20 0 0 1 ${v[2]},${v[3]}" fill="#${fill}" shape-rendering="geometricPrecision"/>`;
};
