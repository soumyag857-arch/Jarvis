import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageRole, useAddMessage, useWebSearch } from "../hooks/useQueries";

interface LocalMessage {
  role: "user" | "jarvis";
  content: string;
  id: string;
}

interface Props {
  isListening: boolean;
  isSpeaking: boolean;
  onListeningChange: (v: boolean) => void;
  onSpeakingChange: (v: boolean) => void;
  onCommand: (cmd: string) => string | null;
  onCameraToggle?: (show: boolean) => void;
}

export default function ChatPanel({
  isListening,
  isSpeaking,
  onListeningChange,
  onSpeakingChange,
  onCommand,
  onCameraToggle,
}: Props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<LocalMessage[]>([
    {
      role: "jarvis",
      content:
        "Good day, sir. All systems operational. JARVIS online. How may I assist you today?",
      id: "init",
    },
  ]);
  const [wakeWordActive, setWakeWordActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const wakeRecognitionRef = useRef<any>(null);
  const addMessage = useAddMessage();
  const webSearch = useWebSearch();

  // Keep a stable ref to processCommand so the wake-word effect doesn't restart
  const processCommandRef = useRef<((text: string) => Promise<void>) | null>(
    null,
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  });

  const speak = useCallback(
    (text: string) => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 0.95;
      utt.pitch = 0.85;
      utt.volume = 0.9;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.name.toLowerCase().includes("daniel") ||
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("alex") ||
          v.lang === "en-GB",
      );
      if (preferred) utt.voice = preferred;
      utt.onstart = () => onSpeakingChange(true);
      utt.onend = () => onSpeakingChange(false);
      window.speechSynthesis.speak(utt);
    },
    [onSpeakingChange],
  );

  const addJarvisMessage = useCallback(
    (content: string) => {
      const id = `j-${Date.now()}`;
      setMessages((prev) => [...prev, { role: "jarvis", content, id }]);
      speak(content);
      addMessage.mutate({ role: MessageRole.jarvis, content });
    },
    [speak, addMessage],
  );

  const processCommand = useCallback(
    async (text: string) => {
      const lower = text.toLowerCase().trim();

      const cmdResponse = onCommand(lower);
      if (cmdResponse !== null) {
        addJarvisMessage(cmdResponse);
        return;
      }

      if (lower.includes("what time") || lower.includes("current time")) {
        const t = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        addJarvisMessage(`The current time is ${t}, sir.`);
        return;
      }

      if (
        lower.includes("what day") ||
        lower.includes("today's date") ||
        lower.includes("what date")
      ) {
        const d = new Date().toLocaleDateString([], {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        });
        addJarvisMessage(`Today is ${d}, sir.`);
        return;
      }

      if (lower.includes("battery")) {
        const nav = navigator as any;
        if (nav.getBattery) {
          const bm = await nav.getBattery();
          const pct = Math.round(bm.level * 100);
          const charge = bm.charging ? " Currently charging." : "";
          addJarvisMessage(`Battery level is at ${pct}%, sir.${charge}`);
        } else {
          addJarvisMessage("Battery API is not available on this device, sir.");
        }
        return;
      }

      if (lower.includes("open youtube") || lower.includes("launch youtube")) {
        addJarvisMessage("Opening YouTube, sir.");
        setTimeout(() => window.open("https://youtube.com", "_blank"), 1000);
        return;
      }

      if (
        lower.includes("open whatsapp") ||
        lower.includes("launch whatsapp")
      ) {
        addJarvisMessage("Opening WhatsApp Web, sir.");
        setTimeout(
          () => window.open("https://web.whatsapp.com", "_blank"),
          1000,
        );
        return;
      }

      if (lower.includes("open maps") || lower.includes("launch maps")) {
        addJarvisMessage("Opening Google Maps, sir.");
        setTimeout(
          () => window.open("https://maps.google.com", "_blank"),
          1000,
        );
        return;
      }

      if (lower.includes("good night")) {
        addJarvisMessage(
          "Good night, sir. Activating sleep mode. WiFi off, brightness reduced, silent mode engaged. Rest well.",
        );
        return;
      }

      if (lower.includes("good morning")) {
        const t = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        addJarvisMessage(
          `Good morning, sir. The time is ${t}. All systems are nominal. Have a productive day.`,
        );
        return;
      }

      if (
        lower.includes("hello") ||
        lower.includes("hi jarvis") ||
        lower.includes("hey jarvis")
      ) {
        addJarvisMessage(
          "Hello, sir. JARVIS at your service. What can I do for you?",
        );
        return;
      }

      if (lower.includes("who are you") || lower.includes("what are you")) {
        addJarvisMessage(
          "I am JARVIS — Just A Rather Very Intelligent System. Your personal AI assistant, sir. Built to serve, protect, and occasionally be witty.",
        );
        return;
      }

      if (lower.includes("thank")) {
        addJarvisMessage("Always a pleasure, sir.");
        return;
      }

      // Location
      if (lower.includes("where am i") || lower.includes("my location")) {
        navigator.geolocation?.getCurrentPosition(
          (pos) => {
            addJarvisMessage(
              `Your coordinates are ${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E, sir.`,
            );
          },
          () => {
            addJarvisMessage(
              "Location access is restricted, sir. Please enable GPS.",
            );
          },
        );
        return;
      }

      // Camera toggle
      if (lower.includes("show camera") || lower.includes("camera on")) {
        onCameraToggle?.(true);
        addJarvisMessage("Enabling visual feed, sir.");
        return;
      }
      if (lower.includes("camera off") || lower.includes("hide camera")) {
        onCameraToggle?.(false);
        addJarvisMessage("Disabling visual feed, sir.");
        return;
      }

      // Vibrate test
      if (lower.includes("vibrate") || lower.includes("test vibrate")) {
        navigator.vibrate?.([500, 200, 500]);
        addJarvisMessage("Haptic test complete, sir.");
        return;
      }

      // Fullscreen
      if (lower.includes("full screen") || lower.includes("fullscreen")) {
        document.documentElement.requestFullscreen().catch(() => {});
        addJarvisMessage("Entering full screen mode, sir.");
        return;
      }

      try {
        addJarvisMessage("Accessing global network. One moment, sir...");
        const result = await webSearch.mutateAsync(text);
        if (result && result.length > 10) {
          addJarvisMessage(result);
        } else {
          addJarvisMessage(
            "My search returned limited results, sir. You may want to refine your query.",
          );
        }
      } catch {
        addJarvisMessage(
          "I'm afraid my network access is currently restricted, sir. Perhaps try a more direct command.",
        );
      }
    },
    [onCommand, addJarvisMessage, webSearch, onCameraToggle],
  );

  // Keep ref in sync with latest processCommand
  processCommandRef.current = processCommand;

  // Continuous wake-word listener (runs once on mount, uses ref for stable access)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    let active = true;

    const startWakeWord = () => {
      if (!active) return;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (e: any) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const transcript = e.results[i][0].transcript.toLowerCase();
          if (transcript.includes("jarvis")) {
            const fullText = e.results[i][0].transcript;
            const id = `u-wake-${Date.now()}`;
            setMessages((prev) => [
              ...prev,
              { role: "user", content: fullText, id },
            ]);
            processCommandRef.current?.(fullText);
          }
        }
      };

      recognition.onerror = () => {
        setTimeout(() => {
          if (active) startWakeWord();
        }, 1000);
      };

      recognition.onend = () => {
        setTimeout(() => {
          if (active) startWakeWord();
        }, 500);
      };

      recognition.start();
      wakeRecognitionRef.current = recognition;
      setWakeWordActive(true);
    };

    startWakeWord();

    return () => {
      active = false;
      wakeRecognitionRef.current?.stop();
      setWakeWordActive(false);
    };
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const id = `u-${Date.now()}`;
    setMessages((prev) => [...prev, { role: "user", content: text, id }]);
    addMessage.mutate({ role: MessageRole.user, content: text });
    await processCommand(text);
  }, [input, addMessage, processCommand]);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addJarvisMessage(
        "Voice recognition is not supported in this browser, sir.",
      );
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = async (e: any) => {
      const transcript = e.results[0][0].transcript;
      onListeningChange(false);
      const id = `u-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { role: "user", content: transcript, id },
      ]);
      addMessage.mutate({ role: MessageRole.user, content: transcript });
      await processCommand(transcript);
    };
    recognition.onerror = () => onListeningChange(false);
    recognition.onend = () => onListeningChange(false);
    recognition.start();
    recognitionRef.current = recognition;
    onListeningChange(true);
  }, [onListeningChange, addJarvisMessage, addMessage, processCommand]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    onListeningChange(false);
  }, [onListeningChange]);

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "oklch(0.08 0.025 240 / 0.6)" }}
    >
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{ borderBottom: "1px solid oklch(0.25 0.1 210 / 0.4)" }}
      >
        <div className="flex flex-col gap-0.5">
          <span
            className="text-xs tracking-widest"
            style={{ color: "oklch(0.5 0.08 210)" }}
          >
            COMMUNICATIONS INTERFACE
          </span>
          {wakeWordActive && (
            <span
              className="text-[9px] tracking-widest animate-blink"
              style={{ color: "oklch(0.55 0.18 145)" }}
            >
              ◎ WAKE WORD ACTIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className="wave-bar"
                  style={{ height: `${8 + (i % 3) * 6}px` }}
                />
              ))}
            </div>
          )}
          {isListening && (
            <span
              className="text-xs animate-blink"
              style={{ color: "oklch(0.65 0.2 145)" }}
            >
              ◉ LISTENING
            </span>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className="max-w-[80%] px-3 py-2 text-xs leading-relaxed"
                style={{
                  background:
                    msg.role === "jarvis"
                      ? "oklch(0.12 0.05 230 / 0.8)"
                      : "oklch(0.55 0.22 250 / 0.25)",
                  border:
                    msg.role === "jarvis"
                      ? "1px solid oklch(0.3 0.12 210 / 0.6)"
                      : "1px solid oklch(0.55 0.22 250 / 0.5)",
                  borderRadius: "2px",
                  color:
                    msg.role === "jarvis"
                      ? "oklch(0.88 0.06 200)"
                      : "oklch(0.78 0.18 200)",
                  boxShadow:
                    msg.role === "jarvis"
                      ? "0 0 12px oklch(0.78 0.18 200 / 0.1)"
                      : "none",
                }}
              >
                {msg.role === "jarvis" && (
                  <div
                    className="text-[10px] mb-1 tracking-widest"
                    style={{ color: "oklch(0.55 0.15 200)" }}
                  >
                    JARVIS
                  </div>
                )}
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div
        className="p-3 flex gap-2"
        style={{ borderTop: "1px solid oklch(0.25 0.1 210 / 0.4)" }}
      >
        <Input
          data-ocid="chat.input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Issue a command, sir..."
          className="flex-1 text-xs h-8"
          style={{
            background: "oklch(0.1 0.04 240 / 0.8)",
            border: "1px solid oklch(0.3 0.1 210 / 0.5)",
            color: "oklch(0.88 0.06 200)",
            borderRadius: "2px",
            fontFamily: "inherit",
          }}
        />
        <Button
          data-ocid="chat.submit_button"
          onClick={handleSend}
          size="sm"
          className="h-8 w-8 p-0"
          style={{
            background: "oklch(0.55 0.22 250 / 0.3)",
            border: "1px solid oklch(0.55 0.22 250 / 0.6)",
            color: "oklch(0.78 0.18 200)",
            borderRadius: "2px",
          }}
        >
          <Send size={14} />
        </Button>
        <Button
          data-ocid="chat.mic_button"
          onClick={isListening ? stopListening : startListening}
          size="sm"
          className="h-8 w-8 p-0"
          style={{
            background: isListening
              ? "oklch(0.65 0.2 145 / 0.3)"
              : "oklch(0.1 0.04 240 / 0.8)",
            border: isListening
              ? "1px solid oklch(0.65 0.2 145 / 0.8)"
              : "1px solid oklch(0.3 0.1 210 / 0.5)",
            color: isListening ? "oklch(0.65 0.2 145)" : "oklch(0.78 0.18 200)",
            borderRadius: "2px",
          }}
        >
          {isListening ? <MicOff size={14} /> : <Mic size={14} />}
        </Button>
      </div>
    </div>
  );
}
