import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import CameraPanel from "./components/CameraPanel";
import ChatPanel from "./components/ChatPanel";
import ControlPanel from "./components/ControlPanel";
import NotesPanel from "./components/NotesPanel";
import RadarVisualizer from "./components/RadarVisualizer";
import StatusBar from "./components/StatusBar";

const RING_SIZES = [250, 200, 150];

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const wakeLockRef = useRef<any>(null);

  // Boot sequence: request permissions, vibration, wake lock
  useEffect(() => {
    // Camera + mic permission
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: true })
      .then(() => console.log("PERMISSIONS GRANTED: camera + mic"))
      .catch(() => {});

    // Geolocation
    navigator.geolocation?.getCurrentPosition(
      () => console.log("PERMISSIONS GRANTED: geolocation"),
      () => {},
    );

    // Notifications
    if ("Notification" in window) {
      Notification.requestPermission().then((p) =>
        console.log("PERMISSIONS GRANTED: notifications", p),
      );
    }

    // Screen wake lock
    const requestWakeLock = async () => {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock?.request(
          "screen",
        );
        console.log("PERMISSIONS GRANTED: wake lock");
      } catch {}
    };
    requestWakeLock();

    // Re-request wake lock on visibility change
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Boot vibration pattern
    navigator.vibrate?.([200, 100, 200]);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      wakeLockRef.current?.release?.();
    };
  }, []);

  // Haptic feedback on every tap
  useEffect(() => {
    const onTap = () => navigator.vibrate?.(50);
    window.addEventListener("touchstart", onTap, { passive: true });
    window.addEventListener("click", onTap);
    return () => {
      window.removeEventListener("touchstart", onTap);
      window.removeEventListener("click", onTap);
    };
  }, []);

  const handleCommand = useCallback((cmd: string): string | null => {
    if (
      cmd.includes("good night") ||
      cmd.includes("sleep mode") ||
      cmd.includes("night mode on")
    ) {
      setNightMode(true);
      return "Good night, sir. Activating sleep mode. Dimming systems.";
    }
    if (cmd.includes("good morning") || cmd.includes("night mode off")) {
      setNightMode(false);
      return null;
    }
    if (
      cmd.includes("take a photo") ||
      cmd.includes("capture") ||
      cmd.includes("take photo")
    ) {
      setShowCamera(true);
      return "Activating visual sensors, sir.";
    }
    if (cmd.includes("camera on") || cmd.includes("show camera")) {
      setShowCamera(true);
      return "Enabling visual feed, sir.";
    }
    if (cmd.includes("camera off") || cmd.includes("hide camera")) {
      setShowCamera(false);
      return "Disabling visual feed, sir.";
    }
    if (cmd.includes("full screen") || cmd.includes("fullscreen")) {
      document.documentElement.requestFullscreen().catch(() => {});
      return "Entering full screen mode, sir.";
    }
    if (cmd.includes("vibrate") || cmd.includes("test vibrate")) {
      navigator.vibrate?.([500, 200, 500]);
      return "Haptic test complete, sir.";
    }
    return null;
  }, []);

  const handleJarvisSpeak = useCallback((msg: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(msg);
    utt.rate = 0.95;
    utt.pitch = 0.85;
    utt.volume = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.name.toLowerCase().includes("daniel") ||
        v.name.toLowerCase().includes("david") ||
        v.lang === "en-GB",
    );
    if (preferred) utt.voice = preferred;
    window.speechSynthesis.speak(utt);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col grid-overlay scanline"
      style={{
        background: nightMode
          ? "oklch(0.04 0.015 240)"
          : "oklch(0.07 0.025 240)",
        filter: nightMode ? "brightness(0.7) sepia(0.1)" : undefined,
        transition: "all 0.8s ease",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <StatusBar />

      <main
        className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden"
        style={{ minHeight: "calc(100vh - 40px)" }}
      >
        {/* LEFT COLUMN */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full lg:w-72 flex flex-col"
          style={{
            borderRight: "1px solid oklch(0.25 0.1 210 / 0.4)",
            background: "oklch(0.08 0.03 240 / 0.6)",
          }}
        >
          <div
            style={{
              borderBottom: "1px solid oklch(0.25 0.1 210 / 0.4)",
              flexShrink: 0,
            }}
          >
            <ControlPanel
              nightMode={nightMode}
              onNightModeChange={setNightMode}
              onJarvisSpeak={handleJarvisSpeak}
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <NotesPanel />
          </div>
        </motion.aside>

        {/* CENTER COLUMN */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center justify-start py-8 px-6 overflow-y-auto"
          style={{
            flex: "1 1 0",
            borderRight: "1px solid oklch(0.25 0.1 210 / 0.4)",
            background: "oklch(0.075 0.028 240 / 0.4)",
            minWidth: 0,
          }}
        >
          <div className="relative mb-6">
            {RING_SIZES.map((size, i) => (
              <div
                key={size}
                className="absolute rounded-full"
                style={{
                  width: size,
                  height: size,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  border: `1px solid oklch(0.78 0.18 200 / ${0.06 + i * 0.04})`,
                  animation: `pulse-ring ${2 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
            <RadarVisualizer
              isListening={isListening}
              isSpeaking={isSpeaking}
            />
          </div>

          <div className="text-center space-y-2">
            <h1
              className="text-3xl font-bold tracking-[0.4em] text-glow-lg"
              style={{ color: "oklch(0.78 0.18 200)" }}
            >
              J.A.R.V.I.S
            </h1>
            <p
              className="text-[10px] tracking-[0.25em]"
              style={{ color: "oklch(0.45 0.1 210)" }}
            >
              JUST A RATHER VERY INTELLIGENT SYSTEM
            </p>
            <div className="flex items-center justify-center gap-3 mt-3">
              <span
                className="animate-blink w-1.5 h-1.5 rounded-full"
                style={{ background: "oklch(0.65 0.2 145)" }}
              />
              <span
                className="text-[10px] tracking-widest"
                style={{ color: "oklch(0.55 0.12 200)" }}
              >
                {isListening
                  ? "VOICE ACTIVE"
                  : isSpeaking
                    ? "SPEAKING"
                    : "STANDBY"}
              </span>
              <span
                className="animate-blink w-1.5 h-1.5 rounded-full"
                style={{
                  background: "oklch(0.65 0.2 145)",
                  animationDelay: "0.5s",
                }}
              />
            </div>
          </div>

          {/* Camera Toggle Button */}
          <button
            type="button"
            data-ocid="camera.open_modal_button"
            onClick={() => setShowCamera((v) => !v)}
            style={{
              marginTop: "20px",
              background: showCamera
                ? "oklch(0.55 0.22 250 / 0.3)"
                : "oklch(0.1 0.04 240 / 0.8)",
              border: showCamera
                ? "1px solid oklch(0.55 0.22 250 / 0.8)"
                : "1px solid oklch(0.3 0.1 210 / 0.5)",
              color: "oklch(0.78 0.18 200)",
              borderRadius: "2px",
              fontFamily: "inherit",
              fontSize: "10px",
              letterSpacing: "0.2em",
              padding: "6px 16px",
              cursor: "pointer",
              boxShadow: showCamera
                ? "0 0 16px oklch(0.78 0.18 200 / 0.3)"
                : "none",
              transition: "all 0.2s",
            }}
          >
            {showCamera ? "◉ VISUAL FEED ON" : "○ VISUAL FEED"}
          </button>

          {/* Camera Panel */}
          <AnimatePresence>
            {showCamera && (
              <motion.div
                key="camera-panel"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.35 }}
                style={{ width: "100%", maxWidth: "420px", overflow: "hidden" }}
                data-ocid="camera.panel"
              >
                <CameraPanel />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Grid */}
          <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-xs">
            {[
              { label: "CPU LOAD", value: "12%" },
              { label: "MEMORY", value: "4.2 GB" },
              { label: "UPTIME", value: "72:14:33" },
              { label: "THREADS", value: "847" },
            ].map((item) => (
              <div
                key={item.label}
                className="px-3 py-2"
                style={{
                  background: "oklch(0.1 0.03 240 / 0.6)",
                  border: "1px solid oklch(0.22 0.09 210 / 0.5)",
                  borderRadius: "2px",
                }}
              >
                <div
                  className="text-[9px] tracking-widest"
                  style={{ color: "oklch(0.4 0.07 210)" }}
                >
                  {item.label}
                </div>
                <div
                  className="text-sm font-bold text-glow"
                  style={{ color: "oklch(0.78 0.18 200)" }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Chat */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-full lg:w-96 flex flex-col"
          style={{ background: "oklch(0.08 0.025 240 / 0.7)" }}
        >
          <div className="flex-1 overflow-hidden">
            <ChatPanel
              isListening={isListening}
              isSpeaking={isSpeaking}
              onListeningChange={setIsListening}
              onSpeakingChange={setIsSpeaking}
              onCommand={handleCommand}
              onCameraToggle={setShowCamera}
            />
          </div>
        </motion.div>
      </main>

      <footer
        className="py-2 px-4 text-center text-[10px] tracking-wider"
        style={{
          borderTop: "1px solid oklch(0.2 0.08 210 / 0.4)",
          color: "oklch(0.35 0.06 210)",
          background: "oklch(0.06 0.02 240 / 0.9)",
        }}
      >
        © {new Date().getFullYear()} ·{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noreferrer"
          style={{ color: "oklch(0.5 0.12 200)" }}
          className="hover:underline"
        >
          Built with ♥ using caffeine.ai
        </a>
      </footer>

      <Toaster />
    </div>
  );
}
