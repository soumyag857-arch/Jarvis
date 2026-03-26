# JARVIS AI Assistant

## Current State
JARVIS has a chat panel with voice input/output, text commands, quick controls, notes, and radar visualizer. Voice recognition via Web Speech API.

## Requested Changes (Diff)

### Add
- Wake word detection: listening for "Jarvis" in continuous mode, then triggering a reply
- Camera access panel: live camera feed shown in the UI
- Device permissions: request microphone, camera, notifications, geolocation on load
- Tap/touch gesture recognition on the screen (log taps as commands)
- Vibration feedback on interactions (navigator.vibrate)
- Screen wake lock to keep screen on
- Continuous background wake-word listener ("jarvis" → JARVIS responds)

### Modify
- ChatPanel: add wake word detection mode (continuous recognition looping)
- App: add CameraPanel component, add permissions initialization on mount

### Remove
- Nothing removed

## Implementation Plan
1. Add CameraPanel component with live video feed and camera toggle
2. Add wake-word continuous listener in ChatPanel (recognizes "jarvis" keyword, responds)
3. Add permissions request utility (mic, camera, notifications, geolocation)
4. Add vibration feedback on button taps and JARVIS responses
5. Add screen wake lock on app init
6. Wire CameraPanel into App layout
