/**
 * Creates an array of random colors for visualizing labels.
 * Label 0 is always black.
 * @param {number} numColors - The number of colors to generate.
 * @returns {Array<Array<number>>} An array of [R, G, B] color arrays.
 */
export function createRandomColors(numColors) {
  let colors = [];
  colors.push([0, 0, 0]); // Background (label 0) is black
  for (let i = 1; i < numColors; i++) {
      colors.push([
          Math.floor(Math.random() * 256), // R
          Math.floor(Math.random() * 256), // G
          Math.floor(Math.random() * 256)  // B
      ]);
  }
  return colors;
}