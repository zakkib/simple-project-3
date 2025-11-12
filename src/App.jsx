import { createSignal, onMount } from 'solid-js';
import './App.css';
import { getOpenCv, translateException } from './opencv.js';
import { imageProcessors } from './imageProcessing/index.js';

function App() {
  // --- Refs for DOM elements ---
  let imgElement;
  let originalCanvas;
  let processedCanvas;
  let processedPlaceholder;
  let inputElement;
  let statusMessage;
  let grayscaleBtn;
  let cannyBtn;
  let contoursBtn;
  let kmeansBtn;
  let combinedContoursBtn;
  let cclBtn;
  let combinedCclBtn;
  let resetBtn;

  // --- State ---
  // Store the loaded cv object in a signal
  const [cv, setCv] = createSignal(null);
  // Store the main image Mat in a plain variable
  let originalMat = null; 

  // --- Lifecycle ---
  onMount(async () => {
    try {
      // Load OpenCV
      const { cv: cvInstance } = await getOpenCv();
      setCv(cvInstance); // Store in signal

      // Now that CV is loaded, enable UI
      console.log('OpenCV.js is loaded.');
      statusMessage.classList.remove('status-message-yellow');
      statusMessage.classList.add('status-message-green');
      statusMessage.textContent = 'OpenCV.js loaded successfully. Ready to process.';
      inputElement.disabled = false;

      // Add file listener
      inputElement.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imgElement.onload = () => {
                    loadOriginalMat(imgElement);
                    toggleControls(true);
                };
                imgElement.src = event.target.result;
                imgElement.classList.remove('image-display-hidden');
                processedPlaceholder.classList.remove('placeholder-hidden');
                processedCanvas.classList.add('canvas-hidden');
            };
            reader.readAsDataURL(file);
        }
      });
    } catch (err) {
      console.error("Failed to load OpenCV", err);
      statusMessage.textContent = 'Failed to load OpenCV.js. Check console.';
    }
  });

  // --- UI Logic ---
  function toggleControls(enable) {
    grayscaleBtn.disabled = !enable;
    cannyBtn.disabled = !enable;
    contoursBtn.disabled = !enable;
    kmeansBtn.disabled = !enable;
    combinedContoursBtn.disabled = !enable;
    cclBtn.disabled = !enable;
    combinedCclBtn.disabled = !enable;
    resetBtn.disabled = !enable;
  }

  // --- Image Loading ---
  function loadOriginalMat(img) {
    const cvInstance = cv(); // Get from signal
    if (!cvInstance) {
      console.error("OpenCV not ready in loadOriginalMat");
      return;
    }

    try {
        if (!img.complete) {
            console.error("Image not fully loaded yet.");
            return;
        }

        if (originalMat) {
            originalMat.delete();
        }
        
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
        console.error("Error loading image into OpenCV Mat:", error);
        const exception = translateException(cvInstance, error);
        console.error(exception);
        statusMessage.textContent = 'Error processing image. Check console.';
    }
  }

  // --- Image Processing ---
  function processImage(operation) {
      const cvInstance = cv(); // Get from signal
      if (!cvInstance) {
          statusMessage.textContent = 'OpenCV is not ready.';
          return;
      }
      if (!originalMat) {
          statusMessage.textContent = 'Please load an image first.';
          return;
      }

      // 1. Find the processor function from the map
      const processor = imageProcessors[operation];
      if (!processor) {
          console.warn("Unknown operation:", operation);
          statusMessage.textContent = `Unknown operation: ${operation}.`;
          return;
      }

      statusMessage.textContent = `Processing image with ${operation}...`;
      
      // 2. Create src and dst Mats. These are managed here.
      const src = originalMat.clone(); 
      const dst = new cvInstance.Mat(src.rows, src.cols, cvInstance.CV_8UC3, new cvInstance.Scalar(0, 0, 0));
      
      try {
          // 3. Call the external processor function
          processor(cvInstance, src, dst);
          
          // 4. Show the result
          cvInstance.imshow('processed-canvas', dst);
          processedPlaceholder.classList.add('placeholder-hidden');
          processedCanvas.classList.remove('canvas-hidden');
          statusMessage.textContent = `Processing complete: ${operation}.`;

      } catch (error) {
          console.error(`Error during ${operation} processing:`, error);
          const exception = translateException(cvInstance, error);
          console.error(exception);
          statusMessage.textContent = `Error during ${operation} processing. Check console.`;
      } finally {
        // 5. Centralized memory management
        src.delete();
        dst.delete();
      }
  }

  function resetImage() {
      const cvInstance = cv(); // Get from signal
      if (originalMat && cvInstance) {
        cvInstance.imshow('processed-canvas', originalMat);
        processedPlaceholder.classList.add('placeholder-hidden');
        processedCanvas.classList.remove('canvas-hidden');
        statusMessage.textContent = 'View reset to original image.';
      } else {
        processedPlaceholder.classList.remove('placeholder-hidden');
        processedCanvas.classList.add('canvas-hidden');
        imgElement.classList.remove('image-display-hidden');
        originalCanvas.classList.add('canvas-hidden');
        if (cvInstance) {
          statusMessage.textContent = 'OpenCV.js loaded successfully. Ready to process.';
        }
        toggleControls(false);
      }
  }


  return (
    <>
      <div className="container">
          <h1 className="header-text">OpenCV Image Processor</h1>
          <p id="status-message" ref={statusMessage} className="status-message status-message-yellow">
              Initializing OpenCV.js...
          </p>

          <div className="control-area">
            <input type="file" id="file-input" accept="image/*" disabled
                  className="file-input-style" ref={inputElement} />
            
            <button onClick={() => processImage('grayscale')} id="grayscale-btn" disabled
                    className="control-button button-indigo" ref={grayscaleBtn}>
                Grayscale
            </button>
            <button onClick={() => processImage('canny')} id="canny-btn" disabled
                    className="control-button button-purple" ref={cannyBtn}>
                Canny Edge
            </button>
            <button onClick={() => processImage('contours')} id="contours-btn" disabled
                    className="control-button button-teal" ref={contoursBtn}>
                Find Contours
            </button>
            <button onClick={() => processImage('kmeans')} id="kmeans-btn" disabled
                    className="control-button button-orange" ref={kmeansBtn}>
                K-Means Quantization
            </button>
            
            <button onClick={() => processImage('combined_contours')} id="combined-contours-btn" disabled
                    className="control-button button-purple" ref={combinedContoursBtn}>
                K-Means Combined with Find Contours
            </button>

            <button onClick={() => processImage('ccl')} id="ccl-btn" disabled
                    className="control-button button-teal" ref={cclBtn}>
                Connected Components Labeling
            </button>
            <button onClick={() => processImage('combined_ccl')} id="combined-ccl-btn" disabled
                    className="control-button button-orange" ref={combinedCclBtn}>
                CCL Combined with K-Means
            </button>

            <button onClick={resetImage} id="reset-btn" disabled
                    className="control-button button-red" ref={resetBtn}>
                Reset
            </button>
          </div>

          <div className="canvas-grid">
              <div className="canvas-panel">
                  <h2 className="panel-heading">Original Image</h2>
                  <div className="canvas-area">
                      <img id="original-image-display" className="image-display-hidden image-display" src="" alt="Original Image Placeholder" ref={imgElement} />
                      <canvas id="original-canvas" className="canvas-hidden" ref={originalCanvas}></canvas>
                  </div>
              </div>

              <div className="canvas-panel">
                  <h2 className="panel-heading">Processed Output</h2>
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