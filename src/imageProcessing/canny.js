
export function processCanny(cv, src, dst) {
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    cv.Canny(gray, dst, 50, 100, 3, false);
    cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGB);
    gray.delete();
}