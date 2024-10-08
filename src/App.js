import "./App.css";
import * as ml5 from "ml5";
import Webcam from "react-webcam";
import { useEffect, useRef, useState } from "react";

// ideal demo size: 335, 640
const dimensions = {
  width: window.innerWidth,
  height: window.innerWidth / 4 * 3,
};

const isMobile = dimensions.width <= 768;

const videoConstraint = isMobile ? { facingMode: { exact: "user" } } : undefined;

function App() {
  const [detected, setDetected] = useState([]);

  const webcamRef = useRef();
  const canvasRef = useRef();
  const { width, height } = dimensions;

  useEffect(() => {
    let detectionInterval;

    const modelLoaded = () => {
      webcamRef.current.video.width = width;
      webcamRef.current.video.height = height;
      canvasRef.current.width = width;
      canvasRef.current.height = height;

      detectionInterval = setInterval(() => {
        detect();
      }, 200);
    };

    const objectDetector = ml5.objectDetector("cocossd", modelLoaded);

    const detect = () => {
      if (webcamRef.current.video.readyState !== 4) {
        console.warn("Video not ready yet");
        return;
      }

      objectDetector.detect(webcamRef.current.video, (err, results) => {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, width, height);
        if (results && results.length) {
          setDetected(results);
          results.forEach((detection) => {
            ctx.strokeStyle = "#FF0000";
            ctx.beginPath();
            ctx.fillStyle = "#FF0000";
            const { label, x, y, width, height } = detection;
            ctx.fillText(label, x / 2 + 5, y / 2 + 10);
            ctx.rect(x / 2, y / 2, width / 2, height / 2);
            ctx.stroke();
          });
        }
      });
    };

    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [width, height]);

  const detectedGroups = Object.groupBy(detected, ({ label }) => label);
  Object.values(detectedGroups).sort((a, b) => {
    return a[0].label > b[0].label;
  });

  return (
    <div style={{ width: dimensions.width }}>
      <Webcam
        ref={webcamRef}
        className="webcam"
        videoConstraints={videoConstraint}
      />
      <canvas ref={canvasRef} className="canvas" />
      <div>
        {Object.values(detectedGroups).map((group) => (
          <div className="card">
            {group[0].label} ({group.length})
          </div>
        ))}
        <button className="button-24">Submit ({detected.length} asset)</button>
      </div>
    </div>
  );
}

export default App;
