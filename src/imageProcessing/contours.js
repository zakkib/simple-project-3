export function processContours(cv, src, dst) {
    const binary = new cv.Mat();
    const gray = new cv.Mat();
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.Canny(gray, binary, 50, 100, 3, false);
    cv.findContours(binary, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    
    let color = new cv.Scalar(0, 255, 0, 255);
    // Draw contours onto the empty dst Mat
    cv.drawContours(dst, contours, -1, color, 1, cv.LINE_8, hierarchy, 100);
    
    gray.delete(); binary.delete(); contours.delete(); hierarchy.delete();
}