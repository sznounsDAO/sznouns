// SPDX-License-Identifier: GPL-3.0

/// @title A library used to convert multi-part RLE compressed images to SVG

/*********************************
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░█████████░░█████████░░░ *
 * ░░░░░░██░░░████░░██░░░████░░░ *
 * ░░██████░░░████████░░░████░░░ *
 * ░░██░░██░░░████░░██░░░████░░░ *
 * ░░██░░██░░░████░░██░░░████░░░ *
 * ░░░░░░█████████░░█████████░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 *********************************/

pragma solidity ^0.8.6;

library MultiPartRLEToSVG {
    struct SVGParams {
        bytes[] parts;
        string background;
    }

    struct ContentBounds {
        uint8 top;
        uint8 right;
        uint8 bottom;
        uint8 left;
    }

    struct Rect {
        uint8 length;
        uint8 colorIndex;
    }

    struct DecodedImage {
        uint8 paletteIndex;
        ContentBounds bounds;
        Rect[] rects;
    }

    /**
     * @notice Given RLE image parts and color palettes, merge to generate a single SVG image.
     */
    function generateSVG(SVGParams memory params, mapping(uint8 => string[]) storage palettes)
        internal
        view
        returns (string memory svg)
    {
        // prettier-ignore
        return string(
            abi.encodePacked(
                '<svg width="320" height="320" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">',
                '<rect width="100%" height="100%" fill="#', params.background, '" />',
                _generateSVGRects(params, palettes),
                '</svg>'
            )
        );
    }

    /**
     * @notice Given RLE image parts and color palettes, generate SVG rects.
     */
    // prettier-ignore
    function _generateSVGRects(SVGParams memory params, mapping(uint8 => string[]) storage palettes)
        private
        view
        returns (string memory svg)
    {
        string[33] memory lookup = [
            '0', '10', '20', '30', '40', '50', '60', '70', 
            '80', '90', '100', '110', '120', '130', '140', '150', 
            '160', '170', '180', '190', '200', '210', '220', '230', 
            '240', '250', '260', '270', '280', '290', '300', '310',
            '320' 
        ];
        string memory rects;
        for (uint8 p = 0; p < params.parts.length; p++) {
            // isGlasses logic
            DecodedImage memory image = _decodeRLEImage(params.parts[p]);
            string[] storage palette = palettes[image.paletteIndex];
            uint256 currentX = image.bounds.left;
            uint256 currentY = image.bounds.top;
            uint256 cursor;
            string[16] memory buffer;
            
            string memory part;
            if (p == 3) {
                uint256 length = image.rects[0].length;
                uint256 radius = length / 2;

                buffer[0] = lookup[radius];
                buffer[1] = lookup[currentX + radius];
                buffer[2] = lookup[currentY + radius];
                buffer[3] = palette[image.rects[0].colorIndex];

                part = string(abi.encodePacked(part, _drawCircle(buffer)));

                buffer[0] = lookup[5 * radius];
                buffer[1] = lookup[1];
                buffer[2] = lookup[currentX + 1];
                buffer[3] = lookup[currentY + 2];
                buffer[4] = palette[image.rects[0].colorIndex];
                
                part = string(abi.encodePacked(part, _drawRect(buffer)));
                
                buffer[0] = lookup[radius];
                buffer[1] = lookup[currentX + 3 * radius + 1];
                buffer[2] = lookup[currentY + radius];
                buffer[3] = palette[image.rects[2].colorIndex];
                
                part = string(abi.encodePacked(part, _drawCircle(buffer)));

                buffer[0] = lookup[1];
                buffer[1] = lookup[2];
                buffer[2] = lookup[currentX + 5 * radius];
                buffer[3] = lookup[currentY + 3];
                buffer[4] = palette[image.rects[2].colorIndex];
                
                part = string(abi.encodePacked(part, _drawRect(buffer)));

                if (image.rects[5].length != 1 && image.rects[14].colorIndex != 90) {          
                    buffer[0] = lookup[currentX + 3];
                    buffer[1] = lookup[currentY + 5];
                    buffer[2] = lookup[currentX + 3];
                    buffer[3] = lookup[currentY + 1];
                    buffer[4] = palette[image.rects[10].colorIndex];
                            
                    part = string(abi.encodePacked(part, _drawPath(buffer)));

                    buffer[0] = lookup[currentX + 3];
                    buffer[1] = lookup[currentY + 1];
                    buffer[2] = lookup[currentX + 3];
                    buffer[3] = lookup[currentY + 5];
                    buffer[4] = 'FFFFFF';
                    part = string(abi.encodePacked(part, _drawPath(buffer)));

                    buffer[0] = lookup[currentX + 10];
                    buffer[1] = lookup[currentY + 5];
                    buffer[2] = lookup[currentX + 10];
                    buffer[3] = lookup[currentY + 1];
                    buffer[4] = palette[image.rects[10].colorIndex];
                    part = string(abi.encodePacked(part, _drawPath(buffer)));

                    buffer[0] =lookup[currentX + 10];
                    buffer[1] =lookup[currentY + 1];
                    buffer[2] =lookup[currentX + 10];
                    buffer[3] =lookup[currentY + 5];
                    buffer[4] ='FFFFFF';

                    part = string(abi.encodePacked(part, _drawPath(buffer)));
                    rects = string(abi.encodePacked(rects, part));
                    return rects;
                }
            }
            for (uint256 i = 0; i < image.rects.length; i++) {
                Rect memory rect = image.rects[i];
                if (p == 3 && rect.colorIndex != 0 && keccak256(abi.encodePacked((palette[rect.colorIndex]))) != keccak256(abi.encodePacked(('000000')))) {
                    buffer[0] = lookup[rect.length];
                    buffer[1] = lookup[1];
                    buffer[2] = lookup[currentX];
                    buffer[3] = lookup[currentY];
                    buffer[4] = palette[rect.colorIndex];
                    part = string(abi.encodePacked(part, _drawRect(buffer)));
                }

                if (p != 3 && rect.colorIndex != 0) {
                    buffer[cursor] = lookup[rect.length];          // width
                    buffer[cursor + 1] = lookup[currentX];         // x
                    buffer[cursor + 2] = lookup[currentY];         // y
                    buffer[cursor + 3] = palette[rect.colorIndex]; // color

                    cursor += 4;

                    if (cursor >= 16) {
                        part = string(abi.encodePacked(part, _getChunk(cursor, buffer)));
                        cursor = 0;
                    }
                }

                currentX += rect.length;
                if (currentX == image.bounds.right) {
                    currentX = image.bounds.left;
                    currentY++;
                }
            }

            if (cursor != 0) {
                part = string(abi.encodePacked(part, _getChunk(cursor, buffer)));
            }
            rects = string(abi.encodePacked(rects, part));
        }
        return rects;
    }

    /**
     * @notice Return a string that consists of all rects in the provided `buffer`.
     */
    // prettier-ignore
    function _getChunk(uint256 cursor, string[16] memory buffer) private pure returns (string memory) {
        string memory chunk;
        for (uint256 i = 0; i < cursor; i += 4) {
            chunk = string(
                abi.encodePacked(
                    chunk,
                    '<rect width="', buffer[i], '" height="10" x="', buffer[i + 1], '" y="', buffer[i + 2], '" fill="#', buffer[i + 3], '" />'
                )
            );
        }
        return chunk;
    }

    /**
     * @notice Decode a single RLE compressed image into a `DecodedImage`.
     */
    function _decodeRLEImage(bytes memory image) private pure returns (DecodedImage memory) {
        uint8 paletteIndex = uint8(image[0]);
        ContentBounds memory bounds = ContentBounds({
            top: uint8(image[1]),
            right: uint8(image[2]),
            bottom: uint8(image[3]),
            left: uint8(image[4])
        });

        uint256 cursor;
        Rect[] memory rects = new Rect[]((image.length - 5) / 2);
        for (uint256 i = 5; i < image.length; i += 2) {
            rects[cursor] = Rect({ length: uint8(image[i]), colorIndex: uint8(image[i + 1]) });
            cursor++;
        }
        return DecodedImage({ paletteIndex: paletteIndex, bounds: bounds, rects: rects });
    }

    // prettier-ignore
    function _drawCircle(string[16] memory buffer) private pure returns (string memory) {
    return string(abi.encodePacked('<circle r="', buffer[0],'" cx="',buffer[1],'" cy="',buffer[2],'" fill="#',buffer[3],'" shape-rendering="geometricPrecision"/>'));
    }

    // prettier-ignore
    function _drawRect(string[16] memory buffer) private pure returns (string memory) {
    return string(abi.encodePacked('<rect width="', buffer[0], '" height="', buffer[1],'" x="', buffer[2], '" y="', buffer[3], '" fill="#', buffer[4], '" />'));
    }

    // prettier-ignore
    function _drawPath(string[16] memory buffer)  private pure returns (string memory) {
        return string(abi.encodePacked('<path d="M', buffer[0], ',',buffer[1], ' A20,20 0 0 1 ', buffer[2],',',buffer[3],'" fill="#',buffer[4],'" shape-rendering="geometricPrecision"/>'));
    }
}
