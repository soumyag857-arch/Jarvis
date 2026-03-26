import { useCamera } from "@/camera/useCamera";
import { Camera, CameraOff, FlipHorizontal, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface Props {
  onCaptured?: (file: File) => void;
}

export default function CameraPanel({ onCaptured }: Props) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);

  const {
    isActive,
    isSupported,
    error,
    isLoading,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    videoRef,
    canvasRef,
  } = useCamera({ facingMode: "environment", quality: 0.92 });

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (file) {
      const url = URL.createObjectURL(file);
      setLastPhoto(url);
      onCaptured?.(file);
    }
  };

  const btnStyle = {
    background: "oklch(0.1 0.04 240 / 0.8)",
    border: "1px solid oklch(0.3 0.1 210 / 0.6)",
    color: "oklch(0.78 0.18 200)",
    borderRadius: "2px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    letterSpacing: "0.12em",
    padding: "4px 10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    transition: "all 0.2s",
    opacity: isLoading ? 0.5 : 1,
  };

  const activeBtnStyle = {
    ...btnStyle,
    background: "oklch(0.55 0.22 250 / 0.3)",
    border: "1px solid oklch(0.55 0.22 250 / 0.7)",
    boxShadow: "0 0 12px oklch(0.78 0.18 200 / 0.3)",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      style={{
        background: "oklch(0.07 0.025 240 / 0.95)",
        border: "1px solid oklch(0.35 0.14 210 / 0.6)",
        borderRadius: "2px",
        overflow: "hidden",
        boxShadow:
          "0 0 24px oklch(0.78 0.18 200 / 0.15), inset 0 0 40px oklch(0.78 0.18 200 / 0.04)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{
          borderBottom: "1px solid oklch(0.25 0.1 210 / 0.4)",
          background: "oklch(0.09 0.03 240 / 0.9)",
        }}
      >
        <div className="flex items-center gap-2">
          <Camera size={12} style={{ color: "oklch(0.78 0.18 200)" }} />
          <span
            className="text-[10px] tracking-[0.2em]"
            style={{ color: "oklch(0.78 0.18 200)" }}
          >
            VISUAL FEED
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[9px] tracking-widest"
            style={{
              color: isActive ? "oklch(0.65 0.2 145)" : "oklch(0.4 0.07 210)",
            }}
          >
            {isActive ? "● LIVE" : "○ INACTIVE"}
          </span>
        </div>
      </div>

      {/* Video Feed */}
      <div
        style={{
          position: "relative",
          aspectRatio: "4/3",
          background: "oklch(0.05 0.02 240)",
          overflow: "hidden",
        }}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: isActive ? "block" : "none",
          }}
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Overlay when inactive */}
        {!isActive && !isLoading && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ color: "oklch(0.35 0.08 210)" }}
          >
            <CameraOff size={32} style={{ opacity: 0.4 }} />
            <span className="text-[10px] tracking-widest">CAMERA OFFLINE</span>
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ color: "oklch(0.78 0.18 200)" }}
          >
            <div
              className="animate-pulse w-6 h-6 rounded-full"
              style={{ background: "oklch(0.78 0.18 200 / 0.4)" }}
            />
            <span className="text-[10px] tracking-widest">INITIALIZING...</span>
          </div>
        )}

        {/* Corner HUD decorations */}
        {isActive && (
          <>
            <div
              className="absolute top-2 left-2 w-4 h-4"
              style={{
                borderTop: "1px solid oklch(0.78 0.18 200 / 0.8)",
                borderLeft: "1px solid oklch(0.78 0.18 200 / 0.8)",
              }}
            />
            <div
              className="absolute top-2 right-2 w-4 h-4"
              style={{
                borderTop: "1px solid oklch(0.78 0.18 200 / 0.8)",
                borderRight: "1px solid oklch(0.78 0.18 200 / 0.8)",
              }}
            />
            <div
              className="absolute bottom-2 left-2 w-4 h-4"
              style={{
                borderBottom: "1px solid oklch(0.78 0.18 200 / 0.8)",
                borderLeft: "1px solid oklch(0.78 0.18 200 / 0.8)",
              }}
            />
            <div
              className="absolute bottom-2 right-2 w-4 h-4"
              style={{
                borderBottom: "1px solid oklch(0.78 0.18 200 / 0.8)",
                borderRight: "1px solid oklch(0.78 0.18 200 / 0.8)",
              }}
            />
            <div
              className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] tracking-widest animate-blink"
              style={{ color: "oklch(0.7 0.22 25)" }}
            >
              ◉ REC
            </div>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          className="px-3 py-1.5 text-[10px] tracking-wider"
          style={{
            background: "oklch(0.12 0.05 15 / 0.5)",
            color: "oklch(0.7 0.22 25)",
            borderBottom: "1px solid oklch(0.3 0.12 15 / 0.4)",
          }}
          data-ocid="camera.error_state"
        >
          ⚠ {error.message}
        </div>
      )}

      {/* Controls */}
      <div
        className="flex items-center gap-2 p-2 flex-wrap"
        style={{ background: "oklch(0.09 0.03 240 / 0.9)" }}
      >
        {isSupported === false && (
          <span
            className="text-[10px] tracking-wider"
            style={{ color: "oklch(0.6 0.2 25)" }}
          >
            CAMERA NOT SUPPORTED
          </span>
        )}

        <button
          type="button"
          data-ocid="camera.primary_button"
          style={isActive ? btnStyle : activeBtnStyle}
          onClick={startCamera}
          disabled={isLoading || isActive || isSupported === false}
        >
          <Camera size={10} /> START
        </button>

        <button
          type="button"
          data-ocid="camera.secondary_button"
          style={isActive ? activeBtnStyle : btnStyle}
          onClick={stopCamera}
          disabled={isLoading || !isActive}
        >
          <CameraOff size={10} /> STOP
        </button>

        {isMobile && (
          <button
            type="button"
            data-ocid="camera.toggle"
            style={btnStyle}
            onClick={() => switchCamera()}
            disabled={isLoading || !isActive}
          >
            <FlipHorizontal size={10} /> SWITCH
          </button>
        )}

        <button
          type="button"
          data-ocid="camera.upload_button"
          style={isActive ? activeBtnStyle : btnStyle}
          onClick={handleCapture}
          disabled={!isActive}
        >
          <Zap size={10} /> CAPTURE
        </button>
      </div>

      {/* Last captured thumbnail */}
      {lastPhoto && (
        <div
          className="px-2 pb-2"
          style={{ background: "oklch(0.09 0.03 240 / 0.9)" }}
        >
          <div
            className="text-[9px] tracking-widest mb-1"
            style={{ color: "oklch(0.4 0.07 210)" }}
          >
            LAST CAPTURE
          </div>
          <img
            src={lastPhoto}
            alt="captured"
            style={{
              width: "100%",
              height: "60px",
              objectFit: "cover",
              border: "1px solid oklch(0.3 0.1 210 / 0.5)",
              borderRadius: "2px",
            }}
          />
        </div>
      )}
    </motion.div>
  );
}
