import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageRole, ReminderStatus } from "../backend";
import { useActor } from "./useActor";

export type { Note, Reminder, Message } from "../backend";
export { MessageRole, ReminderStatus };

export function useGetNotes() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllNotes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetReminders() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["reminders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReminders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetConversation() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["conversation"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getConversation();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateNote() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createNote(content);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useDeleteNote() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteNote(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useCreateReminder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      datetime,
    }: { title: string; datetime: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createReminder(title, datetime);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders"] }),
  });
}

export function useMarkReminderDone() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.markReminderDone(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders"] }),
  });
}

export function useAddMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      role,
      content,
    }: { role: MessageRole; content: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addMessage(role, content);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversation"] }),
  });
}

export function useWebSearch() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (query: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.webSearch(query);
    },
  });
}
