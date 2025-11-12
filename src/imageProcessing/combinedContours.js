/**
 * Applies K-Means first, then finds contours on the result.
 * @param {object} cv - The OpenCV object.
 * @param {cv.Mat} src - The source Mat (RGBA).
 * @param {cv.Mat} dst - The destination Mat (RGB) to write to.
 */
export function processCombinedContours(cv, src, dst) {
    // K-Means (Writes to dst)
    const K = 5;
    const criteria = new cv.TermCriteria(cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 10, 1.0);
    const labels = new cv.Mat();
    const centers = new cv.Mat();
    const rgb = new cv.Mat();
    
    cv.cvtColor(src, rgb, cv.COLOR_RGBA2RGB);
    let N = rgb.rows * rgb.cols;
    let samples32f = new cv.Mat(N, 3, cv.CV_32F);
    
    let rgb_data = rgb.data;
    let samples_data = samples32f.data32F;
    let p_rgb = 0;
    let p_samples = 0;
    for (let i = 0; i < N; i++) {
        samples_data[p_samples++] = rgb_data[p_rgb++] / 255.0;
        samples_data[p_samples++] = rgb_data[p_rgb++] / 255.0;
        samples_data[p_samples++] = rgb_data[p_rgb++] / 255.0;
    }

    cv.kmeans(samples32f, K, labels, criteria, 1, cv.KMEANS_RANDOM_CENTERS, centers);
    centers.convertTo(centers, cv.CV_8U, 255.0);
    
    let p_result = 0;
    let centers_data = centers.data; 
    let labels_data = labels.data32S;
    
    for (let i = 0; i < labels_data.length; ++i) {
        let label = labels_data[i];
        dst.data[p_result++] = centers_data[label * 3 + 0]; // R
        dst.data[p_result++] = centers_data[label * 3 + 1]; // G
        dst.data[p_result++] = centers_data[label * 3 + 2]; // B
    }
    
    rgb.delete(); 
    samples32f.delete(); 
    labels.delete(); 
    centers.delete();

    // Find Contours (Reads from dst, writes back to dst)
    const binary = new cv.Mat();
    const gray = new cv.Mat();
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    
    // Read from dst (the k-means result), not src
    cv.cvtColor(dst, gray, cv.COLOR_RGB2GRAY); 
    cv.Canny(gray, binary, 50, 100, 3, false);
    cv.findContours(binary, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    
    let color = new cv.Scalar(0, 0, 0, 255);
    // Draw contours back onto dst
    cv.drawContours(dst, contours, -1, color, 1, cv.LINE_8, hierarchy, 100); 
    
    gray.delete(); 
    binary.delete(); 
    contours.delete(); 
    hierarchy.delete();
}