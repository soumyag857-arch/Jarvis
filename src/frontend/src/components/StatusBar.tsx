import { Battery, BatteryLow, Clock, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

interface BatteryManager {
  level: number;
  charging: boolean;
}

export default function StatusBar() {
  const [time, setTime] = useState(new Date());
  const [battery, setBattery] = useState<BatteryManager | null>(null);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const nav = navigator as any;
    if (nav.getBattery) {
      nav.getBattery().then((bm: BatteryManager) => {
        setBattery(bm);
      });
    }
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const batteryPct = battery ? Math.round(battery.level * 100) : null;

  return (
    <div
      data-ocid="status.bar"
      className="flex items-center justify-between px-4 py-2 text-xs font-mono"
      style={{
        background: "oklch(0.08 0.03 240 / 0.9)",
        borderBottom: "1px solid oklch(0.25 0.1 210 / 0.5)",
      }}
    >
      {/* Left: JARVIS logo */}
      <div className="flex items-center gap-3">
        <span
          className="text-sm font-bold tracking-[0.3em] text-glow"
          style={{ color: "oklch(0.78 0.18 200)" }}
        >
          J.A.R.V.I.S
        </span>
        <span style={{ color: "oklch(0.4 0.08 210)" }}>v7.2.1</span>
        <span
          className="animate-blink w-1.5 h-1.5 rounded-full"
          style={{ background: "oklch(0.65 0.2 145)" }}
        />
        <span style={{ color: "oklch(0.5 0.08 210)" }}>ONLINE</span>
      </div>

      {/* Right: status indicators */}
      <div className="flex items-center gap-5">
        {/* Battery */}
        {batteryPct !== null && (
          <div
            className="flex items-center gap-1.5"
            style={{
              color:
                batteryPct < 20 ? "oklch(0.7 0.2 25)" : "oklch(0.65 0.2 145)",
            }}
          >
            {batteryPct < 20 ? <BatteryLow size={14} /> : <Battery size={14} />}
            <span>{batteryPct}%</span>
            {battery?.charging && (
              <span style={{ color: "oklch(0.78 0.18 200)" }}>⚡</span>
            )}
          </div>
        )}

        {/* Network */}
        <div
          className="flex items-center gap-1.5"
          style={{
            color: online ? "oklch(0.65 0.2 145)" : "oklch(0.65 0.2 25)",
          }}
        >
          {online ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{online ? "CONNECTED" : "OFFLINE"}</span>
        </div>

        {/* Clock */}
        <div
          className="flex items-center gap-1.5"
          style={{ color: "oklch(0.78 0.18 200)" }}
        >
          <Clock size={14} />
          <span className="text-glow">
            {time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })}
          </span>
        </div>

        {/* Date */}
        <span style={{ color: "oklch(0.5 0.08 210)" }}>
          {time
            .toLocaleDateString([], {
              weekday: "short",
              month: "short",
              day: "numeric",
            })
            .toUpperCase()}
        </span>
      </div>
    </div>
  );
}
