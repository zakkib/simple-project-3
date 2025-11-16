export function processKmeans(cv, src, dst) {
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
        samples_data[p_samples++] = rgb_data[p_rgb++] / 255.0; // R
        samples_data[p_samples++] = rgb_data[p_rgb++] / 255.0; // G
        samples_data[p_samples++] = rgb_data[p_rgb++] / 255.0; // B
    }

    cv.kmeans(samples32f, K, labels, criteria, 1, cv.KMEANS_RANDOM_CENTERS, centers);
    centers.convertTo(centers, cv.CV_8U, 255.0);
    
    let p_result = 0;
    let centers_data = centers.data; 
    let labels_data = labels.data32S; 
    
    // Reconstruct the image into dst Mat
    for (let i = 0; i < labels_data.length; ++i) {
        let label = labels_data[i];
        dst.data[p_result++] = centers_data[label * 3 + 0]; // R
        dst.data[p_result++] = centers_data[label * 3 + 1]; // G
        dst.data[p_result++] = centers_data[label * 3 + 2]; // B
    }
    
    rgb.delete(); samples32f.delete(); labels.delete(); centers.delete();
}