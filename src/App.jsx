import { createSignal } from 'solid-js'
import './App.css'

function App() {
  const [count, setCount] = createSignal(0)

  return (
    <>
      <div className="container">
          <h1 className="header-text">OpenCV Image Processor</h1>
          <p id="status-message" className="status-message status-message-yellow">
              Initializing OpenCV.js...
          </p>

          <div className="control-area">
            <input type="file" id="file-input" accept="image/*" disabled
                  className="file-input-style" />
            <button onclick="processImage('grayscale')" id="grayscale-btn" disabled
                    className="control-button button-indigo">
                Grayscale
            </button>
            <button onclick="processImage('canny')" id="canny-btn" disabled
                    className="control-button button-purple">
                Canny Edge
            </button>
            <button onclick="processImage('contours')" id="contours-btn" disabled
                    className="control-button button-teal">
                Find Contours
            </button>
            <button onclick="processImage('kmeans')" id="kmeans-btn" disabled
                    className="control-button button-orange">
                K-Means Quantization
            </button>
            
            <button onclick="processImage('combined_contours')" id="combined-contours-btn" disabled
                    className="control-button button-purple">
                K-Means Combined with Find Contours
            </button>

            <button onclick="processImage('ccl')" id="ccl-btn" disabled
                    className="control-button button-teal">
                Connected Components Labeling
            </button>
            <button onclick="processImage('combined_ccl')" id="combined-ccl-btn" disabled
                    className="control-button button-orange">
                CCL Combined with K-Means
            </button>

            <button onclick="resetImage()" id="reset-btn" disabled
                    className="control-button button-red">
                Reset
            </button>
          </div>

          <div className="canvas-grid">
              <div className="canvas-panel">
                  <h2 className="panel-heading">Original Image</h2>
                  <div className="canvas-area">
                      <img id="original-image-display" className="image-display-hidden image-display" src="" alt="Original Image Placeholder" />
                      <canvas id="original-canvas" className="canvas-hidden"></canvas>
                  </div>
              </div>

              <div className="canvas-panel">
                  <h2 className="panel-heading">Processed Output</h2>
                  <div className="canvas-area">
                      <canvas id="processed-canvas" className="canvas-hidden"></canvas>
                      <p id="processed-placeholder" className="placeholder-text">Output will appear here.</p>
                  </div>
              </div>
          </div>
      </div>
    </>
  )
}

export default App
