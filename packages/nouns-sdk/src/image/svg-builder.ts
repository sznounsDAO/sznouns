import { DecodedImage } from './types';

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
    if (idx > 3) return '';
    const svgRects: string[] = [];
    const { bounds, rects } = decodeImage(part.data);

    let currentX = bounds.left;
    let currentY = bounds.top;

    // console.log('parts: ', part.filename.startsWith('glasses'));

    const isGlasses = part.filename.startsWith('glasses');
    if (isGlasses) console.log('rects for glasses: ', rects);

    if (isGlasses) {
      const [length, colorIndex1] = rects[0];
      const [, colorIndex2] = rects[2];
      const [, colorIndex3] = rects[5];
      const hexColor1 = paletteColors[colorIndex1];
      const hexColor2 = paletteColors[colorIndex2];
      const hexColor3 = paletteColors[colorIndex3];

      // left eye frame
      result += `<circle r="${(length / 2) * 10}" cx="${(currentX + length / 2) * 10}" cy="${
        (currentY + length / 2) * 10
      }" fill="#${hexColor1}" />`;

      // long frame
      result += `<rect width="${(length * 2 + 1) * 10}" height="10" x="${
        (currentX + length / 2) * 10
      }" y="${(currentY + 2) * 10}" fill="#${hexColor1}" />`;

      // right eye frame
      result += `<circle r="${(length / 2) * 10}" cx="${
        (currentX + (3 * length) / 2 + 1) * 10
      }" cy="${(currentY + length / 2) * 10}" fill="#${hexColor2}" />`;

      // ear frame
      result += `<rect width="10" height="20" x="${(currentX + (5 / 2) * length) * 10}" y="${
        (currentY + 2 + 1) * 10
      }" fill="#${hexColor2}" />`;

      // handle special case of fullblack
      if (colorIndex3 === 1) {
        console.log('here');
        result += `<rect width="10" height="20" x="${(currentX + 1) * 10}" y="${
          (currentY + 1) * 10
        }" fill="#${hexColor3}" />`;
        result += `<rect width="10" height="20" x="${(currentX + length + 1 + 1) * 10}" y="${
          (currentY + 1) * 10
        }" fill="#${hexColor3}" />`;

        return result;
      }

      // handle special case of black-rgb
      if (colorIndex3 === 100) {
        const [, colorIndex4] = rects[14];
        const [, colorIndex5] = rects[16];
        const hexColor4 = paletteColors[colorIndex4];
        const hexColor5 = paletteColors[colorIndex5];
        // loop this...
        result += `<rect width="10" height="10" x="${(currentX + 2) * 10}" y="${
          (currentY + 1) * 10
        }" fill="#${hexColor3}" />`;
        result += `<rect width="10" height="10" x="${(currentX + 1) * 10}" y="${
          (currentY + 3) * 10
        }" fill="#${hexColor4}" />`;
        result += `<rect width="10" height="10" x="${(currentX + 4) * 10}" y="${
          (currentY + 3) * 10
        }" fill="#${hexColor5}" />`;

        result += `<rect width="10" height="10" x="${(currentX + length + 1 + 2) * 10}" y="${
          (currentY + 1) * 10
        }" fill="#${hexColor3}" />`;
        result += `<rect width="10" height="10" x="${(currentX + length + 1 + 1) * 10}" y="${
          (currentY + 3) * 10
        }" fill="#${hexColor4}" />`;
        result += `<rect width="10" height="10" x="${(currentX + length + 1 + 4) * 10}" y="${
          (currentY + 3) * 10
        }" fill="#${hexColor5}" />`;

        return result;
      }

      // left eye
      result += `<path d="M${(currentX + 3) * 10},${(currentY + 1) * 10} A${20},${20} 0 0 1 ${
        (currentX + 3) * 10
      },${(currentY + 5) * 10}" fill="white" />`;

      result += `<path d="M${(currentX + 3) * 10},${(currentY + 5) * 10} A${20},${20} 0 0 1 ${
        (currentX + 3) * 10
      },${(currentY + 1) * 10}" fill="#${hexColor3}" />`;

      // right eye
      result += `<path d="M${(currentX + 3 + length + 1) * 10},${
        (currentY + 1) * 10
      } A${20},${20} 0 0 1 ${(currentX + 3 + length + 1) * 10},${
        (currentY + 5) * 10
      }" fill="white" />`;

      result += `<path d="M${(currentX + 3 + length + 1) * 10},${
        (currentY + 5) * 10
      } A${20},${20} 0 0 1 ${(currentX + 3 + length + 1) * 10},${
        (currentY + 1) * 10
      }" fill="#${hexColor3}" />`;

      return result;
    }

    rects.forEach(rect => {
      const [length, colorIndex] = rect;
      const hexColor = paletteColors[colorIndex];

      // Do not push rect if transparent
      if (!isGlasses && colorIndex !== 0) {
        svgRects.push(
          `<rect width="${length * 10}" height="10" x="${currentX * 10}" y="${
            currentY * 10
          }" fill="#${hexColor}" />`,
        );
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
