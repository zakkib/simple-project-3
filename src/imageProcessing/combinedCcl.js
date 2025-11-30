import { createRandomColors } from './utils.js';

export function processCombinedCcl(cv, src, dst, options = {}) {
    // --- Part 1: Run K-Means ---
    const kmeansResult = new cv.Mat(); // Temporary mat for k-means output
    const K = options.k || 8;
    const criteria = new cv.TermCriteria(cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 10, 1.0);
    const labels_kmeans = new cv.Mat();
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

    cv.kmeans(samples32f, K, labels_kmeans, criteria, 1, cv.KMEANS_RANDOM_CENTERS, centers);
    centers.convertTo(centers, cv.CV_8U, 255.0);

    // --- EXTRACT COLORS ---
    const colors = [];
    const centers_data = centers.data; 
    for(let i = 0; i < centers.rows; i++) {
        colors.push({
            r: centers_data[i * 3],
            g: centers_data[i * 3 + 1],
            b: centers_data[i * 3 + 2]
        });
    }
    // ----------------------
    
    // Rebuild image into a temporary Mat
    const tempResult = new cv.Mat(src.rows, src.cols, cv.CV_8UC3);
    let p_result = 0;
    let labels_data_kmeans = labels_kmeans.data32S;
    
    for (let i = 0; i < labels_data_kmeans.length; ++i) {
        let label = labels_data_kmeans[i];
        tempResult.data[p_result++] = centers_data[label * 3 + 0];
        tempResult.data[p_result++] = centers_data[label * 3 + 1];
        tempResult.data[p_result++] = centers_data[label * 3 + 2];
    }
    tempResult.copyTo(kmeansResult);
    
    // Cleanup K-Means Mats
    rgb.delete(); 
    samples32f.delete(); 
    labels_kmeans.delete(); 
    centers.delete(); 
    tempResult.delete();

    // --- Part 2: Run CCL on K-Means result ---
    const binary = new cv.Mat();
    const gray = new cv.Mat();
    
    // Use the 'kmeansResult' as input
    cv.cvtColor(kmeansResult, gray, cv.COLOR_RGB2GRAY);
    cv.Canny(gray, binary, 50, 100, 3, false);
    
    const labels_ccl = new cv.Mat();
    const stats = new cv.Mat();
    const centroids = new cv.Mat();
    let numLabels = cv.connectedComponentsWithStats(binary, labels_ccl, stats, centroids);

    // Visualize the labels into the final 'dst' Mat
    let randomColors = createRandomColors(numLabels);
    
    let p_dst = 0;
    let labels_data_ccl = labels_ccl.data32S;
    for (let i = 0; i < labels_data_ccl.length; i++) {
        let label = labels_data_ccl[i];
        let color = randomColors[label];
        dst.data[p_dst++] = color[0]; // R
        dst.data[p_dst++] = color[1]; // G
        dst.data[p_dst++] = color[2]; // B
    }
    
    // Cleanup CCL Mats
    kmeansResult.delete(); gray.delete(); binary.delete(); labels_ccl.delete(); stats.delete(); centroids.delete();

    return { colors };
}