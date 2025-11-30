import { createSignal, onMount, For } from 'solid-js';
import './App.css';
import { getOpenCv, translateException } from './opencv.js';
import { imageProcessors } from './imageProcessing/index.js';

// Pre-defined images. For this to work offline, place images in the 'public' folder 
// and reference them like '/image1.jpg'. 
// Using picsum for instant demonstration purposes.
const PREDETERMINED_IMAGES = [
    { name: 'Low Poly', url: '/low_poly.png' },
    { name: 'Piet Mondrian', url: '/piet_mondrian.jpg' },
    { name: 'Truchet', url: '/truchet.jpg' },
    { name: 'Voronoi', url: '/voronoi.png' }
];

function App() {
  // --- Refs for DOM elements ---
  let imgElement;
  let originalCanvas;
  let processedCanvas;
  let processedPlaceholder;
  let inputElement;
  let statusMessage;
  
  // Buttons refs
  let grayscaleBtn;
  let cannyBtn;
  let contoursBtn;
  let kmeansBtn;
  let combinedContoursBtn;
  let cclBtn;
  let combinedCclBtn;
  // let SX;  
  let resetBtn;

  // --- State ---
  const [cv, setCv] = createSignal(null);
  const [difficulty, setDifficulty] = createSignal('medium'); // easy, medium, hard
  const [palette, setPalette] = createSignal([]);
  
  let originalMat = null; 

  // --- Helper to convert RGB to Hex ---
  const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');

  // --- Lifecycle ---
  onMount(async () => {
    try {
      const { cv: cvInstance } = await getOpenCv();
      setCv(cvInstance);

      console.log('OpenCV.js is loaded.');
      statusMessage.classList.remove('status-message-yellow');
      statusMessage.classList.add('status-message-green');
      statusMessage.textContent = 'OpenCV.js loaded successfully. Ready to process.';
      inputElement.disabled = false;

      // File listener
      inputElement.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
               loadSrc(event.target.result);
            };
            reader.readAsDataURL(file);
        }
      });
    } catch (err) {
      console.error("Failed to load OpenCV", err);
      statusMessage.textContent = 'Failed to load OpenCV.js. Check console.';
    }
  });

  // --- Unified Image Loader ---
  function loadSrc(srcUrl) {
    imgElement.onload = () => {
        loadOriginalMat(imgElement);
        toggleControls(true);
        setPalette([]); // Reset palette on new image
    };
    imgElement.crossOrigin = "Anonymous"; // Allow loading from external URLs
    imgElement.src = srcUrl;
    imgElement.classList.remove('image-display-hidden');
    processedPlaceholder.classList.remove('placeholder-hidden');
    processedCanvas.classList.add('canvas-hidden');
  }

  function toggleControls(enable) {
    const btns = [grayscaleBtn, cannyBtn, contoursBtn, kmeansBtn, combinedContoursBtn, cclBtn, combinedCclBtn, resetBtn];
    btns.forEach(btn => { if(btn) btn.disabled = !enable; });
  }

  function loadOriginalMat(img) {
    const cvInstance = cv();
    if (!cvInstance) return;

    try {
        if (originalMat) originalMat.delete();
        
        originalCanvas.width = img.naturalWidth;
        originalCanvas.height = img.naturalHeight;
        originalCanvas.getContext('2d').drawImage(img, 0, 0);
        originalCanvas.classList.remove('canvas-hidden');
        imgElement.classList.add('image-display-hidden');

        originalMat = cvInstance.imread(originalCanvas);
        processedCanvas.width = originalMat.cols;
        processedCanvas.height = originalMat.rows;

        statusMessage.textContent = `Image loaded: ${originalMat.cols}x${originalMat.rows}. Choose a process.`;
    } catch (error) {
        console.error(error);
        statusMessage.textContent = 'Error processing image.';
    }
  }

  // --- Image Processing ---
  function getKFromDifficulty() {
      const level = difficulty();
      if (level === 'easy') return 5; //easy
      if (level === 'hard') return 30; //hard
      return 15; // medium
  }

  function processImage(operation) {
      const cvInstance = cv();
      if (!cvInstance || !originalMat) return;

      const processor = imageProcessors[operation];
      if (!processor) return;

      statusMessage.textContent = `Processing ${operation} (Difficulty: ${difficulty()})...`;
      
      const src = originalMat.clone(); 
      const dst = new cvInstance.Mat(src.rows, src.cols, cvInstance.CV_8UC3, new cvInstance.Scalar(0, 0, 0));
      
      try {
          // Calculate K based on difficulty
          const kValue = getKFromDifficulty();
          
          // Pass K in options
          const result = processor(cvInstance, src, dst, { k: kValue });
          
          cvInstance.imshow('processed-canvas', dst);
          processedPlaceholder.classList.add('placeholder-hidden');
          processedCanvas.classList.remove('canvas-hidden');
          
          // Handle Colors if returned
          if (result && result.colors) {
            setPalette(result.colors);
            statusMessage.textContent = `Processing complete. Found ${result.colors.length} colors (K=${kValue}).`;
          } else {
            setPalette([]);
            statusMessage.textContent = `Processing complete: ${operation}.`;
          }

      } catch (error) {
          console.error(error);
          statusMessage.textContent = `Error during ${operation} processing.`;
      } finally {
        src.delete();
        dst.delete();
      }
  }

  function resetImage() {
      const cvInstance = cv();
      if (originalMat && cvInstance) {
        cvInstance.imshow('processed-canvas', originalMat);
        processedPlaceholder.classList.add('placeholder-hidden');
        processedCanvas.classList.remove('canvas-hidden');
        setPalette([]); // Clear palette
        statusMessage.textContent = 'View reset to original image.';
      }
  }

  return (
    <>
      <div className="container">
          <h1 className="header-text">OpenCV Image Processor</h1>
          <p id="status-message" ref={statusMessage} className="status-message status-message-yellow">
              Initializing OpenCV.js...
          </p>

          <div className="control-section">
            {/* New: Image Selection & Difficulty */}
            <div className="settings-panel">
                <div className="setting-group">
                    <label>Select Image Source:</label>
                    <div className="image-selector-row">
                        <select onChange={(e) => loadSrc(e.target.value)} className="simple-select">
                            <option value="">-- Choose Preset --</option>
                            <For each={PREDETERMINED_IMAGES}>{(img) => 
                                <option value={img.url}>{img.name}</option>
                            }</For>
                        </select>
                        <span className="or-divider">OR</span>
                        <input type="file" id="file-input" accept="image/*" disabled
                            className="file-input-style-compact" ref={inputElement} />
                    </div>
                </div>

                <div className="setting-group">
                    <label>Difficulty (K-Means Complexity):</label>
                    <select value={difficulty()} onChange={(e) => setDifficulty(e.target.value)} className="simple-select">
                        <option value="easy">Easy (5 Color)</option>
                        <option value="medium">Medium (15 Color)</option>
                        <option value="hard">Hard (30 Color)</option>
                    </select>
                </div>
            </div>

            {/* Buttons */}
            <div className="button-area">
                <button onClick={() => processImage('grayscale')} ref={grayscaleBtn} disabled className="control-button button-indigo">Grayscale</button>
                <button onClick={() => processImage('canny')} ref={cannyBtn} disabled className="control-button button-purple">Canny Edge</button>
                <button onClick={() => processImage('contours')} ref={contoursBtn} disabled className="control-button button-teal">Find Contours</button>
                <button onClick={() => processImage('kmeans')} ref={kmeansBtn} disabled className="control-button button-orange">K-Means</button>
                <button onClick={() => processImage('combined_contours')} ref={combinedContoursBtn} disabled className="control-button button-purple">KM + Contours</button>
                <button onClick={() => processImage('ccl')} ref={cclBtn} disabled className="control-button button-teal">CCL</button>
                <button onClick={() => processImage('combined_ccl')} ref={combinedCclBtn} disabled className="control-button button-orange">KM + CCL</button>
                <button onClick={resetImage} ref={resetBtn} disabled className="control-button button-red">Reset</button>
            </div>
          </div>

          {/* New: Color Palette Display */}
          {palette().length > 0 && (
            <div className="palette-container">
                <h3>Extracted Colors:</h3>
                <div className="palette-grid">
                    <For each={palette()}>{(color) => 
                        <div className="color-item">
                            <div className="color-swatch" style={{'background-color': `rgb(${color.r},${color.g},${color.b})`}}></div>
                            <span className="color-hex">{rgbToHex(color.r, color.g, color.b)}</span>
                        </div>
                    }</For>
                </div>
            </div>
          )}

          <div className="canvas-grid">
              <div className="canvas-panel">
                  <h2 className="panel-heading">Original</h2>
                  <div className="canvas-area">
                      <img id="original-image-display" className="image-display-hidden image-display" src="" alt="" ref={imgElement} />
                      <canvas id="original-canvas" className="canvas-hidden" ref={originalCanvas}></canvas>
                  </div>
              </div>

              <div className="canvas-panel">
                  <h2 className="panel-heading">Processed</h2>
                  <div className="canvas-area">
                      <canvas id="processed-canvas" className="canvas-hidden" ref={processedCanvas}></canvas>
                      <p id="processed-placeholder" className="placeholder-text" ref={processedPlaceholder}>Output will appear here.</p>
                  </div>
              </div>
          </div>
      </div>
    </>
  )
}

export default App