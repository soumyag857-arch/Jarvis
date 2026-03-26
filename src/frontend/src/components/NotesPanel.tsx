import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  ReminderStatus,
  useCreateNote,
  useCreateReminder,
  useDeleteNote,
  useGetNotes,
  useGetReminders,
  useMarkReminderDone,
} from "../hooks/useQueries";

export default function NotesPanel() {
  const [noteText, setNoteText] = useState("");
  const [reminderText, setReminderText] = useState("");
  const [reminderTime, setReminderTime] = useState("");

  const { data: notes = [] } = useGetNotes();
  const { data: reminders = [] } = useGetReminders();
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();
  const createReminder = useCreateReminder();
  const markDone = useMarkReminderDone();

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    createNote.mutate(noteText.trim());
    setNoteText("");
  };

  const handleAddReminder = () => {
    if (!reminderText.trim()) return;
    const dt = reminderTime
      ? BigInt(new Date(reminderTime).getTime() * 1_000_000)
      : BigInt(Date.now() * 1_000_000);
    createReminder.mutate({ title: reminderText.trim(), datetime: dt });
    setReminderText("");
    setReminderTime("");
  };

  const inputStyle = {
    background: "oklch(0.1 0.04 240 / 0.8)",
    border: "1px solid oklch(0.25 0.1 210 / 0.5)",
    color: "oklch(0.88 0.06 200)",
    borderRadius: "2px",
    fontFamily: "inherit",
    fontSize: "11px",
    height: "28px",
  };

  const btnStyle = {
    background: "oklch(0.55 0.22 250 / 0.25)",
    border: "1px solid oklch(0.55 0.22 250 / 0.5)",
    color: "oklch(0.78 0.18 200)",
    borderRadius: "2px",
    height: "28px",
    width: "28px",
    padding: 0,
    flexShrink: 0,
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div
        className="text-[10px] tracking-widest mb-3"
        style={{ color: "oklch(0.5 0.08 210)" }}
      >
        DATA STORAGE
      </div>

      <Tabs defaultValue="notes" className="flex-1 flex flex-col">
        <TabsList
          className="mb-3 h-7 p-0.5 gap-1"
          style={{
            background: "oklch(0.1 0.03 240 / 0.8)",
            border: "1px solid oklch(0.25 0.1 210 / 0.4)",
          }}
        >
          <TabsTrigger
            data-ocid="notes.tab"
            value="notes"
            className="text-[10px] h-6 px-3 tracking-wider"
          >
            NOTES
          </TabsTrigger>
          <TabsTrigger
            data-ocid="reminders.tab"
            value="reminders"
            className="text-[10px] h-6 px-3 tracking-wider"
          >
            REMINDERS
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="notes"
          className="flex-1 flex flex-col space-y-2 mt-0"
        >
          <div className="flex gap-1.5">
            <Input
              data-ocid="notes.input"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
              placeholder="Add note..."
              style={inputStyle}
              className="flex-1 border-none"
            />
            <Button
              data-ocid="notes.add_button"
              onClick={handleAddNote}
              size="sm"
              style={btnStyle}
            >
              <Plus size={12} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            <AnimatePresence>
              {notes.length === 0 && (
                <div
                  data-ocid="notes.empty_state"
                  className="text-[10px] py-4 text-center"
                  style={{ color: "oklch(0.4 0.06 210)" }}
                >
                  No notes stored, sir.
                </div>
              )}
              {notes.map((note, idx) => (
                <motion.div
                  key={note.id.toString()}
                  data-ocid={`notes.item.${idx + 1}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-start gap-2 px-2 py-1.5"
                  style={{
                    background: "oklch(0.1 0.03 240 / 0.5)",
                    border: "1px solid oklch(0.2 0.08 210 / 0.4)",
                    borderRadius: "2px",
                  }}
                >
                  <span
                    className="flex-1 text-[10px] leading-relaxed"
                    style={{ color: "oklch(0.75 0.06 200)" }}
                  >
                    {note.content}
                  </span>
                  <button
                    type="button"
                    data-ocid={`notes.delete_button.${idx + 1}`}
                    onClick={() => deleteNote.mutate(note.id)}
                    style={{
                      color: "oklch(0.55 0.18 25)",
                      flexShrink: 0,
                      marginTop: "1px",
                    }}
                  >
                    <Trash2 size={11} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent
          value="reminders"
          className="flex-1 flex flex-col space-y-2 mt-0"
        >
          <div className="flex gap-1.5">
            <Input
              data-ocid="reminders.input"
              value={reminderText}
              onChange={(e) => setReminderText(e.target.value)}
              placeholder="Reminder title..."
              style={inputStyle}
              className="flex-1 border-none"
            />
            <input
              data-ocid="reminders.datetime_input"
              type="datetime-local"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              style={{ ...inputStyle, width: "130px" }}
            />
            <Button
              data-ocid="reminders.add_button"
              onClick={handleAddReminder}
              size="sm"
              style={btnStyle}
            >
              <Plus size={12} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            <AnimatePresence>
              {reminders.length === 0 && (
                <div
                  data-ocid="reminders.empty_state"
                  className="text-[10px] py-4 text-center"
                  style={{ color: "oklch(0.4 0.06 210)" }}
                >
                  No reminders set, sir.
                </div>
              )}
              {reminders.map((rem, idx) => (
                <motion.div
                  key={rem.id.toString()}
                  data-ocid={`reminders.item.${idx + 1}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2 px-2 py-1.5"
                  style={{
                    background: "oklch(0.1 0.03 240 / 0.5)",
                    border: "1px solid oklch(0.2 0.08 210 / 0.4)",
                    borderRadius: "2px",
                    opacity: rem.status === ReminderStatus.done ? 0.5 : 1,
                  }}
                >
                  <Bell
                    size={10}
                    style={{ color: "oklch(0.55 0.15 200)", flexShrink: 0 }}
                  />
                  <span
                    className="flex-1 text-[10px]"
                    style={{
                      color: "oklch(0.75 0.06 200)",
                      textDecoration:
                        rem.status === ReminderStatus.done
                          ? "line-through"
                          : "none",
                    }}
                  >
                    {rem.title}
                  </span>
                  {rem.status === ReminderStatus.pending && (
                    <button
                      type="button"
                      data-ocid={`reminders.confirm_button.${idx + 1}`}
                      onClick={() => markDone.mutate(rem.id)}
                      style={{ color: "oklch(0.65 0.2 145)", flexShrink: 0 }}
                    >
                      <Check size={11} />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
