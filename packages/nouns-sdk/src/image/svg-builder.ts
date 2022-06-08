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
    if (idx > 3) return '';
    const svgRects: string[] = [];
    const { bounds, rects } = decodeImage(part.data);

    let currentX = bounds.left;
    let currentY = bounds.top;

    const BRIDGE = 1;
    const FRAME_OFFSET = 2;

    const isGlasses = part.filename.startsWith('glasses');
    if (isGlasses) console.log('rects for glasses: ', rects);

    if (isGlasses) {
      const [length, colorIndex1] = rects[0];
      const [, colorIndex2] = rects[2];
      const [len3, colorIndex3] = rects[5];
      const [, colorIndex4] = rects[14];
      const [, colorIndex99] = rects[10];
      const hexColor1 = paletteColors[colorIndex1];
      const hexColor2 = paletteColors[colorIndex2];
      const hexColor3 = paletteColors[colorIndex3];
      const hexColor99 = paletteColors[colorIndex99];
      console.log('hex color: ', hexColor99);
      const radius = length / 2;

      // GLASSES FRAME: left eye frame, right eye frame, long frame, ear frame
      result += drawCircle(radius, currentX + radius, currentY + radius, hexColor1);
      result += drawRect(5 * radius + BRIDGE, 1, currentX, currentY + FRAME_OFFSET, hexColor1);
      result += drawCircle(radius, currentX + 3 * radius + BRIDGE, currentY + radius, hexColor2);
      result += drawRect(1, 2, currentX + 5 * radius, currentY + FRAME_OFFSET + 1, hexColor2);

      // EDGE CASE 1: square-fullblack, add white rectangles
      // if (colorIndex3 === 1) {
      //   result += drawRect(1, 2, currentX + 1, currentY + 1, hexColor3);
      //   result += drawRect(1, 2, currentX + length + BRIDGE + 1, currentY + 1, hexColor3);
      //   return result;
      // }

      // EDGE CASE 2: squad-black-rgb, add three rbg squares
      // if (colorIndex4 === 90) {
      //   const [, colorIndex4] = rects[14];
      //   const [, colorIndex5] = rects[16];
      //   const hexColor4 = paletteColors[colorIndex4];
      //   const hexColor5 = paletteColors[colorIndex5];

      //   // left eye squares
      //   result += drawRect(1, 1, currentX + 2, currentY + 1, hexColor3);
      //   result += drawRect(1, 1, currentX + 1, currentY + 3, hexColor4);
      //   result += drawRect(1, 1, currentX + 4, currentY + 3, hexColor5);

      //   // right eye squares
      //   result += drawRect(1, 1, currentX + length + 1 + 2, currentY + 1, hexColor3);
      //   result += drawRect(1, 1, currentX + length + 1 + 1, currentY + 3, hexColor4);
      //   result += drawRect(1, 1, currentX + length + 1 + 4, currentY + 3, hexColor5);

      //   return result;
      // }

      // EVEYRONE SHOULD FALL HERE EXCEPT (1) FULLBLACK, (2) RGB
      // ROUND EYES: all apply except square-fullblack and square-black-rgb
      if (len3 !== 1 && colorIndex4 !== 90) {
        // left eye (colored half, white half)
        result += drawPath(currentX + 3, currentY + 5, currentX + 3, currentY + 1, hexColor99);
        result += drawPath(currentX + 3, currentY + 1, currentX + 3, currentY + 5, 'FFFFFF');

        // right eye (colored half, white half)
        result += drawPath(currentX + 10, currentY + 5, currentX + 10, currentY + 1, hexColor99);
        result += drawPath(currentX + 10, currentY + 1, currentX + 10, currentY + 5, 'FFFFFF');

        return result;
      }
    }

    rects.forEach(rect => {
      const [length, colorIndex] = rect;
      const hexColor = paletteColors[colorIndex];

      // Do not push rect if transparent
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

// /**
//  * Given RLE parts, palette colors, and a background color, build an SVG image.
//  * @param parts The RLE part datas
//  * @param paletteColors The hex palette colors
//  * @param bgColor The hex background color
//  */
// export const buildSVG = (
//   parts: { filename: string; data: string }[],
//   paletteColors: string[],
//   bgColor: string,
// ): string => {
//   const svgWithoutEndTag = parts.reduce((result, part, idx) => {
//     if (idx > 3) return '';
//     const svgRects: string[] = [];
//     const { bounds, rects } = decodeImage(part.data);

//     let currentX = bounds.left;
//     let currentY = bounds.top;

//     const CONVERSION = 10;
//     const BRIDGE = 1;
//     const FRAME_OFFSET = 2;

//     const isGlasses = part.filename.startsWith('glasses');
//     if (isGlasses) console.log('rects for glasses: ', rects);

//     if (isGlasses) {
//       const [length, colorIndex1] = rects[0];
//       const [, colorIndex2] = rects[2];
//       const [, colorIndex3] = rects[5];
//       const hexColor1 = paletteColors[colorIndex1];
//       const hexColor2 = paletteColors[colorIndex2];
//       const hexColor3 = paletteColors[colorIndex3];

//       // GLASSES FRAME

//       const drawCircle = (r: number, cx: number, cy: number, fill: string) => {
//         const x = [r, cx, cy].map(i => i * CONVERSION);
//         return `<circle r="${x[0]}" cx="${x[1]}" cy="${x[2]}" fill="#${fill}" />`;
//       };

//       // left eye frame
//       const radius = length / 2;
//       result += drawCircle(radius, currentX + radius, currentY + radius, hexColor1)`<circle r="${
//         radius * CONVERSION
//       }" cx="${(currentX + radius) * CONVERSION}" cy="${
//         (currentY + radius) * CONVERSION
//       }" fill="#${hexColor1}" />`;

//       // long frame (TODO: make sure new conversion works)
//       result += `<rect width="${(5 * radius + BRIDGE) * CONVERSION}" height="10" x="${
//         currentX * CONVERSION
//       }" y="${(currentY + FRAME_OFFSET) * CONVERSION}" fill="#${hexColor1}" />`;

//       // right eye frame
//       result += drawCircle(radius, currentX + 3 * radius, currentY + radius, hexColor2);

//       // right eye frame
//       result += `<circle r="${radius * CONVERSION}" cx="${
//         (currentX + 3 * radius + BRIDGE) * CONVERSION
//       }" cy="${(currentY + radius) * CONVERSION}" fill="#${hexColor2}" />`;

//       // ear frame
//       result += `<rect width="10" height="20" x="${(currentX + 5 * radius) * CONVERSION}" y="${
//         (currentY + FRAME_OFFSET + 1) * CONVERSION
//       }" fill="#${hexColor2}" />`;

//       // EYES FOR EDGE CASES

//       // handle special case of fullblack
//       if (colorIndex3 === 1) {
//         console.log('here');
//         result += `<rect width="10" height="20" x="${(currentX + 1) * 10}" y="${
//           (currentY + 1) * 10
//         }" fill="#${hexColor3}" />`;
//         result += `<rect width="10" height="20" x="${(currentX + length + 1 + 1) * 10}" y="${
//           (currentY + 1) * 10
//         }" fill="#${hexColor3}" />`;

//         return result;
//       }

//       // handle special case of black-rgb
//       if (colorIndex3 === 100) {
//         const [, colorIndex4] = rects[14];
//         const [, colorIndex5] = rects[16];
//         const hexColor4 = paletteColors[colorIndex4];
//         const hexColor5 = paletteColors[colorIndex5];
//         // loop this...
//         result += `<rect width="10" height="10" x="${(currentX + 2) * 10}" y="${
//           (currentY + 1) * 10
//         }" fill="#${hexColor3}" />`;
//         result += `<rect width="10" height="10" x="${(currentX + 1) * 10}" y="${
//           (currentY + 3) * 10
//         }" fill="#${hexColor4}" />`;
//         result += `<rect width="10" height="10" x="${(currentX + 4) * 10}" y="${
//           (currentY + 3) * 10
//         }" fill="#${hexColor5}" />`;

//         result += `<rect width="10" height="10" x="${(currentX + length + 1 + 2) * 10}" y="${
//           (currentY + 1) * 10
//         }" fill="#${hexColor3}" />`;
//         result += `<rect width="10" height="10" x="${(currentX + length + 1 + 1) * 10}" y="${
//           (currentY + 3) * 10
//         }" fill="#${hexColor4}" />`;
//         result += `<rect width="10" height="10" x="${(currentX + length + 1 + 4) * 10}" y="${
//           (currentY + 3) * 10
//         }" fill="#${hexColor5}" />`;

//         return result;
//       }

//       // ROUND EYES USING PATHS

//       // left eye
//       result += `<path d="M${(currentX + 3) * 10},${(currentY + 1) * 10} A${20},${20} 0 0 1 ${
//         (currentX + 3) * 10
//       },${(currentY + 5) * 10}" fill="white" />`;

//       result += `<path d="M${(currentX + 3) * 10},${(currentY + 5) * 10} A${20},${20} 0 0 1 ${
//         (currentX + 3) * 10
//       },${(currentY + 1) * 10}" fill="#${hexColor3}" />`;

//       // right eye
//       result += `<path d="M${(currentX + 3 + length + 1) * 10},${
//         (currentY + 1) * 10
//       } A${20},${20} 0 0 1 ${(currentX + 3 + length + 1) * 10},${
//         (currentY + 5) * 10
//       }" fill="white" />`;

//       result += `<path d="M${(currentX + 3 + length + 1) * 10},${
//         (currentY + 5) * 10
//       } A${20},${20} 0 0 1 ${(currentX + 3 + length + 1) * 10},${
//         (currentY + 1) * 10
//       }" fill="#${hexColor3}" />`;

//       return result;
//     }

//     rects.forEach(rect => {
//       const [length, colorIndex] = rect;
//       const hexColor = paletteColors[colorIndex];

//       // Do not push rect if transparent
//       if (!isGlasses && colorIndex !== 0) {
//         svgRects.push(
//           `<rect width="${length * 10}" height="10" x="${currentX * 10}" y="${
//             currentY * 10
//           }" fill="#${hexColor}" />`,
//         );
//       }

//       currentX += length;
//       if (currentX === bounds.right) {
//         currentX = bounds.left;
//         currentY++;
//       }
//     });
//     result += svgRects.join('');
//     return result;
//   }, `<svg width="320" height="320" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#${bgColor}" />`);

//   return `${svgWithoutEndTag}</svg>`;
// };
