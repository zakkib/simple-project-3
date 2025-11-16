
export function processGrayscale(cv, src, dst) {
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
}