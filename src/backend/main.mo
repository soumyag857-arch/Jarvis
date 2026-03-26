import Text "mo:core/Text";
import List "mo:core/List";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import OutCall "http-outcalls/outcall";

actor {
  //////////////////////////////////////
  //        Type Definitions         //
  //////////////////////////////////////

  type Note = {
    id : Nat;
    content : Text;
    timestamp : Time.Time;
  };

  module Note {
    public func compare(note1 : Note, note2 : Note) : Order.Order {
      Nat.compare(note1.id, note2.id);
    };
  };

  type Reminder = {
    id : Nat;
    title : Text;
    datetime : Time.Time;
    status : ReminderStatus;
  };

  module Reminder {
    public func compare(reminder1 : Reminder, reminder2 : Reminder) : Order.Order {
      Nat.compare(reminder1.id, reminder2.id);
    };
  };

  type ReminderStatus = {
    #pending;
    #done;
  };

  type Message = {
    role : MessageRole;
    content : Text;
    timestamp : Time.Time;
  };

  type MessageRole = {
    #user;
    #jarvis;
  };

  type Routine = {
    name : Text;
    actions : [Text];
  };

  type SearchResult = {
    results : Text;
  };

  //////////////////////////////////////
  //          State Variables         //
  //////////////////////////////////////

  var nextId = 0;

  func getNextId() : Nat {
    let id = nextId;
    nextId += 1;
    id;
  };

  let notes = Map.empty<Nat, Note>();
  let reminders = Map.empty<Nat, Reminder>();
  let conversationHistory = List.empty<Message>();
  let routines = Map.empty<Text, Routine>();

  //////////////////////////////////////
  //          Notes Methods           //
  //////////////////////////////////////

  public shared ({ caller }) func createNote(content : Text) : async Note {
    let note : Note = {
      id = getNextId();
      content;
      timestamp = Time.now();
    };
    notes.add(note.id, note);
    note;
  };

  public query ({ caller }) func getNote(id : Nat) : async Note {
    switch (notes.get(id)) {
      case (null) { Runtime.trap("Note not found") };
      case (?note) { note };
    };
  };

  public query ({ caller }) func getAllNotes() : async [Note] {
    notes.values().toArray().sort();
  };

  public shared ({ caller }) func deleteNote(id : Nat) : async () {
    if (not notes.containsKey(id)) { Runtime.trap("Note not found") };
    notes.remove(id);
  };

  //////////////////////////////////////
  //         Reminders Methods        //
  //////////////////////////////////////

  public shared ({ caller }) func createReminder(title : Text, datetime : Time.Time) : async Reminder {
    let reminder : Reminder = {
      id = getNextId();
      title;
      datetime;
      status = #pending;
    };
    reminders.add(reminder.id, reminder);
    reminder;
  };

  public query ({ caller }) func getReminder(id : Nat) : async Reminder {
    switch (reminders.get(id)) {
      case (null) { Runtime.trap("Reminder not found") };
      case (?reminder) { reminder };
    };
  };

  public query ({ caller }) func getAllReminders() : async [Reminder] {
    reminders.values().toArray().sort();
  };

  public shared ({ caller }) func markReminderDone(id : Nat) : async () {
    switch (reminders.get(id)) {
      case (null) { Runtime.trap("Reminder not found") };
      case (?reminder) {
        let updatedReminder = { reminder with status = #done };
        reminders.add(id, updatedReminder);
      };
    };
  };

  //////////////////////////////////////
  //     Conversation History         //
  //////////////////////////////////////

  public shared ({ caller }) func addMessage(role : MessageRole, content : Text) : async () {
    let message : Message = {
      role;
      content;
      timestamp = Time.now();
    };

    conversationHistory.add(message);

    if (conversationHistory.size() > 50) {
      ignore conversationHistory.removeLast();
    };
  };

  public query ({ caller }) func getConversation() : async [Message] {
    conversationHistory.toArray().reverse();
  };

  //////////////////////////////////////
  //          Routines Methods        //
  //////////////////////////////////////

  public shared ({ caller }) func createRoutine(name : Text, actions : [Text]) : async Routine {
    let routine : Routine = {
      name;
      actions;
    };

    routines.add(name, routine);
    routine;
  };

  public query ({ caller }) func getRoutine(name : Text) : async Routine {
    switch (routines.get(name)) {
      case (null) { Runtime.trap("Routine not found") };
      case (?routine) { routine };
    };
  };

  public query ({ caller }) func getAllRoutines() : async [Routine] {
    routines.values().toArray();
  };

  //////////////////////////////////////
  //          Web Search              //
  //////////////////////////////////////

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func webSearch(queryText : Text) : async Text {
    let url = "https://api.duckduckgo.com/?q=" # queryText # "&format=json";
    await OutCall.httpGetRequest(url, [], transform);
  };
};
