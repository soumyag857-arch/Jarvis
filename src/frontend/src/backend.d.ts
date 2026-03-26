import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Note {
    id: bigint;
    content: string;
    timestamp: Time;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface Reminder {
    id: bigint;
    status: ReminderStatus;
    title: string;
    datetime: Time;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Message {
    content: string;
    role: MessageRole;
    timestamp: Time;
}
export interface Routine {
    name: string;
    actions: Array<string>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export enum MessageRole {
    user = "user",
    jarvis = "jarvis"
}
export enum ReminderStatus {
    pending = "pending",
    done = "done"
}
export interface backendInterface {
    addMessage(role: MessageRole, content: string): Promise<void>;
    createNote(content: string): Promise<Note>;
    createReminder(title: string, datetime: Time): Promise<Reminder>;
    createRoutine(name: string, actions: Array<string>): Promise<Routine>;
    deleteNote(id: bigint): Promise<void>;
    getAllNotes(): Promise<Array<Note>>;
    getAllReminders(): Promise<Array<Reminder>>;
    getAllRoutines(): Promise<Array<Routine>>;
    getConversation(): Promise<Array<Message>>;
    getNote(id: bigint): Promise<Note>;
    getReminder(id: bigint): Promise<Reminder>;
    getRoutine(name: string): Promise<Routine>;
    markReminderDone(id: bigint): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    webSearch(queryText: string): Promise<string>;
}
