/**
 * Converts the source image to grayscale.
 * @param {object} cv - The OpenCV object.
 * @param {cv.Mat} src - The source Mat (RGBA).
 * @param {cv.Mat} dst - The destination Mat (RGB) to write to.
 */
export function processGrayscale(cv, src, dst) {
    // cvtColor can write a 1-channel result to a 3-channel Mat
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
}