import { Slider } from "@/components/ui/slider";
import {
  BellOff,
  Bluetooth,
  Map as MapIcon,
  MessageCircle,
  Moon,
  Settings,
  Sun,
  Volume2,
  Wifi,
  Youtube,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface Props {
  nightMode: boolean;
  onNightModeChange: (v: boolean) => void;
  onJarvisSpeak: (msg: string) => void;
}

export default function ControlPanel({
  nightMode,
  onNightModeChange,
  onJarvisSpeak,
}: Props) {
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const [silent, setSilent] = useState(false);
  const [volume, setVolume] = useState([70]);
  const [brightness, setBrightness] = useState([80]);

  const toggleWifi = () => {
    const next = !wifi;
    setWifi(next);
    onJarvisSpeak(next ? "WiFi enabled, sir." : "WiFi disabled, sir.");
  };

  const toggleBluetooth = () => {
    const next = !bluetooth;
    setBluetooth(next);
    onJarvisSpeak(
      next ? "Bluetooth activated, sir." : "Bluetooth deactivated, sir.",
    );
  };

  const toggleSilent = () => {
    const next = !silent;
    setSilent(next);
    onJarvisSpeak(next ? "Silent mode on, sir." : "Silent mode off, sir.");
  };

  const toggleNight = () => {
    const next = !nightMode;
    onNightModeChange(next);
    onJarvisSpeak(
      next
        ? "Night mode activated. Pleasant evening, sir."
        : "Night mode deactivated, sir.",
    );
  };

  const openApp = (name: string, url: string) => {
    onJarvisSpeak(`Opening ${name}, sir.`);
    setTimeout(() => window.open(url, "_blank"), 800);
  };

  const btnStyle = (active: boolean) => ({
    background: active
      ? "oklch(0.55 0.22 250 / 0.3)"
      : "oklch(0.1 0.03 240 / 0.8)",
    border: active
      ? "1px solid oklch(0.55 0.22 250 / 0.7)"
      : "1px solid oklch(0.25 0.1 210 / 0.4)",
    color: active ? "oklch(0.78 0.18 200)" : "oklch(0.5 0.08 210)",
    boxShadow: active ? "0 0 12px oklch(0.55 0.22 250 / 0.3)" : "none",
    borderRadius: "2px",
    padding: "10px 8px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "4px",
    cursor: "pointer",
    transition: "all 0.2s",
    fontSize: "10px",
  });

  return (
    <div className="p-4 space-y-4">
      <div
        className="text-[10px] tracking-widest"
        style={{ color: "oklch(0.5 0.08 210)" }}
      >
        CONTROL MATRIX
      </div>

      <div className="grid grid-cols-4 gap-2">
        <motion.button
          type="button"
          data-ocid="ctrl.wifi_toggle"
          whileTap={{ scale: 0.94 }}
          onClick={toggleWifi}
          style={btnStyle(wifi)}
        >
          <Wifi size={18} />
          <span>WIFI</span>
        </motion.button>
        <motion.button
          type="button"
          data-ocid="ctrl.bluetooth_toggle"
          whileTap={{ scale: 0.94 }}
          onClick={toggleBluetooth}
          style={btnStyle(bluetooth)}
        >
          <Bluetooth size={18} />
          <span>BT</span>
        </motion.button>
        <motion.button
          type="button"
          data-ocid="ctrl.silent_toggle"
          whileTap={{ scale: 0.94 }}
          onClick={toggleSilent}
          style={btnStyle(silent)}
        >
          <BellOff size={18} />
          <span>SILENT</span>
        </motion.button>
        <motion.button
          type="button"
          data-ocid="ctrl.night_toggle"
          whileTap={{ scale: 0.94 }}
          onClick={toggleNight}
          style={btnStyle(nightMode)}
        >
          <Moon size={18} />
          <span>NIGHT</span>
        </motion.button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Volume2
            size={12}
            style={{ color: "oklch(0.55 0.15 200)", flexShrink: 0 }}
          />
          <span
            className="text-[10px] w-12 shrink-0"
            style={{ color: "oklch(0.5 0.08 210)" }}
          >
            VOL {volume[0]}%
          </span>
          <Slider
            data-ocid="ctrl.volume_slider"
            value={volume}
            onValueChange={setVolume}
            min={0}
            max={100}
            step={1}
            className="flex-1"
          />
        </div>
        <div className="flex items-center gap-3">
          <Sun
            size={12}
            style={{ color: "oklch(0.55 0.15 200)", flexShrink: 0 }}
          />
          <span
            className="text-[10px] w-12 shrink-0"
            style={{ color: "oklch(0.5 0.08 210)" }}
          >
            BRT {brightness[0]}%
          </span>
          <Slider
            data-ocid="ctrl.brightness_slider"
            value={brightness}
            onValueChange={(v) => {
              setBrightness(v);
              document.body.style.filter = `brightness(${(v[0] / 100) * 0.5 + 0.5})`;
            }}
            min={10}
            max={100}
            step={1}
            className="flex-1"
          />
        </div>
      </div>

      <div>
        <div
          className="text-[10px] tracking-widest mb-2"
          style={{ color: "oklch(0.5 0.08 210)" }}
        >
          APP LAUNCHERS
        </div>
        <div className="grid grid-cols-4 gap-2">
          <motion.button
            type="button"
            data-ocid="ctrl.youtube_button"
            whileTap={{ scale: 0.94 }}
            onClick={() => openApp("YouTube", "https://youtube.com")}
            style={btnStyle(false)}
          >
            <Youtube size={18} />
            <span>YT</span>
          </motion.button>
          <motion.button
            type="button"
            data-ocid="ctrl.whatsapp_button"
            whileTap={{ scale: 0.94 }}
            onClick={() => openApp("WhatsApp", "https://web.whatsapp.com")}
            style={btnStyle(false)}
          >
            <MessageCircle size={18} />
            <span>WA</span>
          </motion.button>
          <motion.button
            type="button"
            data-ocid="ctrl.maps_button"
            whileTap={{ scale: 0.94 }}
            onClick={() => openApp("Maps", "https://maps.google.com")}
            style={btnStyle(false)}
          >
            <MapIcon size={18} />
            <span>MAPS</span>
          </motion.button>
          <motion.button
            type="button"
            data-ocid="ctrl.settings_button"
            whileTap={{ scale: 0.94 }}
            onClick={() =>
              onJarvisSpeak(
                "Settings panel is accessible via the interface, sir.",
              )
            }
            style={btnStyle(false)}
          >
            <Settings size={18} />
            <span>SYS</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
