# Dance: Head Tilt

When you do ballroom dancing it's a prerequisit that you keep your head line parallel to the shoulder line. This web app aims to help training this, by giving you more nuanced feedback than a mirror can do. It's only meant to be used while facing the camera and having full upper body visibility (including arms).

## How it works

The base workflow is like this:

1. Enable webcam and get image of the dancer
2. Use the `posenet` tensorflow model to estimate the position of shoulders, eyes, ears and elbows
3. Draw virtual lines through them
4. Calculate the difference in angle
5. Indicate how the dancer needs to adjust to become parallel

## TODOs

- [ ] add elbow into calculation
- [ ] ensure full offline support
- [ ] use high or low detail / interval mode, depending on the machine (or user setting)
- [ ] indicate lines visually
- [ ] indicate how to fix the head tilt in UI
