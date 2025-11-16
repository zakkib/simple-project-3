import { createRandomColors } from './utils.js';

export function processCcl(cv, src, dst) {
    const binary = new cv.Mat();
    const gray = new cv.Mat();
    
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.Canny(gray, binary, 50, 100, 3, false);
    
    // Find connected components
    const labels = new cv.Mat();
    const stats = new cv.Mat();
    const centroids = new cv.Mat();
    let numLabels = cv.connectedComponentsWithStats(binary, labels, stats, centroids);

    // Visualize the labels with random colors
    let colors = createRandomColors(numLabels);
    
    let p_dst = 0;
    let labels_data = labels.data32S;
    for (let i = 0; i < labels_data.length; i++) {
        let label = labels_data[i];
        let color = colors[label];
        dst.data[p_dst++] = color[0]; // R
        dst.data[p_dst++] = color[1]; // G
        dst.data[p_dst++] = color[2]; // B
    }
    
    gray.delete(); binary.delete(); labels.delete(); stats.delete(); centroids.delete();
}