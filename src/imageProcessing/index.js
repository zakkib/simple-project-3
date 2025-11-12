import { processGrayscale } from './grayscale.js';
import { processCanny } from './canny.js';
import { processContours } from './contours.js';
import { processKmeans } from './kmeans.js';
import { processCombinedContours } from './combinedContours.js';
import { processCcl } from './ccl.js';
import { processCombinedCcl } from './combinedCcl.js';

export const imageProcessors = {
  grayscale: processGrayscale,
  canny: processCanny,
  contours: processContours,
  kmeans: processKmeans,
  combined_contours: processCombinedContours,
  ccl: processCcl,
  combined_ccl: processCombinedCcl,
};