import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ScanCamera({ onScan }) {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const [captured, setCaptured] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [success, setSuccess] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [showCamera, setShowCamera] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!showCamera) return;
    const startCamera = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        videoRef.current.srcObject = stream;
        setVideoReady(false);
      }
    };
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCamera]);

  const handleLoadedMetadata = () => {
    setVideoReady(true);
  };

  const capture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      setCaptured(blob);
      setShowCamera(false);
      // Stop camera stream after capture
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }, "image/jpeg");
  };

  const recapture = () => {
    setCaptured(null);
    setResult(null);
    setSuccess(false);
    setShowCamera(true);
  };

  const handleGallery = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCaptured(file);
      setShowCamera(false);
    }
  };

  const openGallery = () => {
    fileInputRef.current.click();
  };

  const scan = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("image", captured, "capture.jpg");
    try {
      const res = await fetch("http://localhost:5000/analyze", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Server error: " + res.status);
      const data = await res.json();
      setResult(data);
      setSuccess(true);
      if (onScan) onScan(data);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  const reset = () => {
    setCaptured(null);
    setResult(null);
    setSuccess(false);
    setShowCamera(true);
  };

  const handleCancel = () => {
    navigate("/");
  };

  const renderResult = (data) => {
    if (!data) return null;
    if (Array.isArray(data)) {
      return (
        <div>
          {data.map((card, idx) => (
            <div className="card mb-3" key={idx}>
              <div className="card-body">
                <h6 className="card-title mb-2">Card {idx + 1}</h6>
                <ul className="list-group list-group-flush">
                  {Object.entries(card).map(([key, value]) => (
                    <li className="list-group-item px-0 py-1" key={key}>
                      <strong>{key.replace(/_/g, " ")}: </strong>
                      {typeof value === "object" && value !== null ? (
                        <pre className="mb-0 d-inline" style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{JSON.stringify(value, null, 2)}</pre>
                      ) : (
                        String(value)
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (typeof data === "object") {
      return (
        <ul className="list-group list-group-flush">
          {Object.entries(data).map(([key, value]) => (
            <li className="list-group-item px-0 py-1" key={key}>
              <strong>{key.replace(/_/g, " ")}: </strong>
              {typeof value === "object" && value !== null ? (
                <pre className="mb-0 d-inline" style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{JSON.stringify(value, null, 2)}</pre>
              ) : (
                String(value)
              )}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <pre className="bg-light p-2 rounded" style={{ fontSize: 14, overflow: "auto" }}>{JSON.stringify(data, null, 2)}</pre>
    );
  };

  return (
    <div className="camera-fullscreen-bg-neutral">
      {showCamera ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            onLoadedMetadata={handleLoadedMetadata}
            className="camera-video-full"
          />
          <div className="camera-controls-full">
            <button className="btn btn-light btn-lg me-2" onClick={handleCancel} type="button">Cancel</button>
            <button className="btn btn-primary btn-lg mx-2" onClick={capture} disabled={loading || !videoRef.current?.srcObject || !videoReady} type="button">
              <i className="bi bi-camera"></i>
            </button>
            <button className="btn btn-light btn-lg ms-2" onClick={openGallery} type="button">Gallery</button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleGallery} />
          </div>
        </>
      ) : (
        <div className="camera-capture-card">
          <div className="camera-capture-img-wrap">
            <img src={URL.createObjectURL(captured)} alt="Captured" className="camera-capture-img" />
          </div>
          <div className="camera-capture-actions">
            <button className="btn btn-success btn-lg mb-3 w-100" onClick={scan} disabled={loading} type="button">Scan</button>
            <button className="btn btn-warning btn-lg mb-3 w-100" onClick={recapture} type="button">Recapture</button>
            <button className="btn btn-light btn-lg w-100" onClick={handleCancel} type="button">Cancel</button>
          </div>
        </div>
      )}
      {loading && <div className="camera-overlay">Scanning...</div>}
      {/* Show result below the capture area, not as overlay */}
      {result && !loading && (
        <div className="camera-result-card alert alert-success mt-4" style={{ wordBreak: 'break-word', boxShadow: '0 4px 16px rgba(0,0,0,0.10)', borderRadius: 16, padding: 20, maxWidth: 700, margin: '32px auto 0 auto', background: '#fff' }}>
          <strong style={{ fontSize: 20 }}>Scan Successful!</strong>
          <div className="mt-2">{renderResult(result)}</div>
          <button className="btn btn-outline-secondary mt-2" onClick={recapture} type="button">Scan Another</button>
        </div>
      )}
      <style>{`
        .camera-fullscreen-bg-neutral {
          min-height: 100vh;
          width: 100vw;
          background: #f5f6fa;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 48px;
        }
        .camera-video-full {
          width: 100vw;
          height: 60vh;
          object-fit: cover;
          border-radius: 18px;
          background: #e0e0e0;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        }
        .camera-controls-full {
          width: 100vw;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 24px;
        }
        .camera-capture-card {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.10);
          padding: 32px 24px;
          max-width: 700px;
          margin: 32px auto 0 auto;
        }
        .camera-capture-img-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .camera-capture-img {
          max-width: 320px;
          max-height: 320px;
          border-radius: 14px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.10);
        }
        .camera-capture-actions {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: center;
          margin-left: 32px;
        }
        .camera-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.2);
          color: #222;
          font-size: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3200;
        }
        .camera-result-card {
          margin-top: 32px;
        }
        @media (max-width: 700px) {
          .camera-capture-card {
            flex-direction: column;
            padding: 18px 6px;
          }
          .camera-capture-actions {
            margin-left: 0;
            margin-top: 24px;
          }
        }
      `}</style>
    </div>
  );
}
