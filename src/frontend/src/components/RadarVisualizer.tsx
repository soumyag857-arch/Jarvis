import { useEffect, useRef } from "react";

interface Props {
  isListening: boolean;
  isSpeaking: boolean;
}

export default function RadarVisualizer({ isListening, isSpeaking }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const angleRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 220;
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2 - 10;

    const blips: { angle: number; r: number; life: number }[] = [];
    if (isListening || isSpeaking) {
      for (let i = 0; i < 5; i++) {
        blips.push({
          angle: Math.random() * Math.PI * 2,
          r: Math.random() * maxR * 0.7 + 20,
          life: 1,
        });
      }
    }

    const neonBlue = "rgba(0, 212, 255,";
    const neonBlue2 = "rgba(0, 128, 255,";

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      ctx.beginPath();
      ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(5, 10, 18, 0.9)";
      ctx.fill();

      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (maxR / 4) * i, 0, Math.PI * 2);
        ctx.strokeStyle = `${neonBlue} 0.15)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.strokeStyle = `${neonBlue} 0.1)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - maxR, cy);
      ctx.lineTo(cx + maxR, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - maxR);
      ctx.lineTo(cx, cy + maxR);
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angleRef.current);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, maxR, -Math.PI / 8, 0);
      ctx.closePath();
      ctx.fillStyle = `${neonBlue} 0.15)`;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(maxR, 0);
      ctx.strokeStyle = `${neonBlue} 0.9)`;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 8;
      ctx.shadowColor = "rgba(0, 212, 255, 0.8)";
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      for (const b of blips) {
        const bx = cx + Math.cos(b.angle) * b.r;
        const by = cy + Math.sin(b.angle) * b.r;
        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${b.life})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(0, 212, 255, 0.9)";
        ctx.fill();
        ctx.shadowBlur = 0;
        b.life -= 0.005;
        if (b.life <= 0) {
          b.angle = Math.random() * Math.PI * 2;
          b.r = Math.random() * maxR * 0.7 + 20;
          b.life = 1;
        }
      }

      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 212, 255, 0.9)";
      ctx.shadowBlur = 12;
      ctx.shadowColor = "rgba(0, 212, 255, 1)";
      ctx.fill();
      ctx.shadowBlur = 0;

      if (isListening || isSpeaking) {
        const pulseR = maxR * 0.4 + Math.sin(Date.now() / 400) * 10;
        ctx.beginPath();
        ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = isListening
          ? "rgba(0, 255, 180, 0.5)"
          : `${neonBlue2} 0.5)`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 16;
        ctx.shadowColor = isListening
          ? "rgba(0,255,180,0.7)"
          : "rgba(0,128,255,0.7)";
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      angleRef.current += 0.025;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [isListening, isSpeaking]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-full"
      style={{
        boxShadow: "0 0 30px rgba(0,212,255,0.3), 0 0 60px rgba(0,212,255,0.1)",
      }}
    />
  );
}
