import { RGBAColor } from './types';

/**
 * Convert the provided number to a passed hex string
 * @param c
 * @param pad The desired number of chars in the hex string
 */
export const toPaddedHex = (c: number, pad = 2): string => {
  return c.toString(16).padStart(pad, '0');
};

/**
 * Convert an RGB color to hex (without `#` prefix)
 * @param r The red value
 * @param g The green value
 * @param b The blue value
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return `${toPaddedHex(r)}${toPaddedHex(g)}${toPaddedHex(b)}`;
};

/**
 * Fetch the hex color of a coordinate given a getRgbaAt function
 * @param getRgbaAt A function used to fetch the RGBA values at specific x-y coordinates
 * @param x x-coordinate of image
 * @param y y-coordinate of image
 */
export const getHexColorAt = (
  getRgbaAt: (x: number, y: number) => RGBAColor,
  x: number,
  y: number,
): string => {
  const { r, g, b, a } = getRgbaAt(x, y);
  if (a === 0) return `00FFFFFF`;
  return `${toPaddedHex(r)}${toPaddedHex(g)}${toPaddedHex(b)}`;
};

/**
 * Check whether the given list of pixels have the same color
 * @param getRgbaAt A function used to fetch the RGBA values at specific x-y coordinates
 * @param coordinates list of [x, y] coordinates
 */
export const isSingleColor = (
  getRgbaAt: (x: number, y: number) => RGBAColor,
  coordinates: number[][],
): boolean => {
  const [x0, y0] = coordinates[0];
  const initColor = getHexColorAt(getRgbaAt, x0, y0);
  for (const [x, y] of coordinates) {
    const color = getHexColorAt(getRgbaAt, x, y);
    if (initColor !== color) return false;
  }
  return true;
};
