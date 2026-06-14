# gamepad_by_XinyueSun

`gamepad_by_XinyueSun` is a Max for Live device for using a game controller as a performance and mapping interface in Ableton Live. It is designed for working with buttons, sticks, directional controls, touchpad input, and motion sensor data such as gyroscope and accelerometer values.

Current version: `v0.3.1`

## Download

The ready-to-use Max for Live device is available in:

```text
dist/gamepad_by_XinyueSun_v0.3.1.amxd
```

For GitHub Releases, download the `.amxd` file from the release assets.

## Requirements

- Ableton Live 12 with Max for Live support
- Max/MSP bundled with Ableton Live, or a compatible installed Max version
- A compatible game controller

## Compatibility

Tested with:

- Ableton Live 12
- Sony DualSense / PlayStation 5 controller
- Xbox controller
- 8BitDo controller

Most standard game controllers should work, but support is not guaranteed for
every controller model. Button and stick input is more broadly supported, while
touchpad, gyroscope, and accelerometer data depend on the controller hardware,
operating system, driver support, and Max for Live environment.

This version was developed and tested as part of Xinyue Sun's gamepad controller
experiments. If you use a different operating system, Ableton Live version, Max
version, or controller model, behavior may vary.

## Installation

1. Download `gamepad_by_XinyueSun_v0.3.1.amxd`.
2. Open Ableton Live.
3. Drag the `.amxd` device into a MIDI track or Max for Live device area.
4. Connect your game controller before opening or reloading the device if the controller is not detected.

## Project Structure

```text
dist/
  gamepad_by_XinyueSun_v0.3.1.amxd

src/
  foldLayout1.js
  gamepad_sensor_gyro_accel_jsui_appearance.js
  gamepad_touchpad_two_finger_jsui.js
  gamepad_viz_ps5_data_instrument.js

docs/
  screenshots and documentation assets
```

## Main Features

This device is designed around the extended control set of the Sony DualSense /
PlayStation 5 controller, including touchpad and motion sensor input. Other
controllers, such as Xbox and 8BitDo controllers, can still be used for their
available controls. If a controller does not include a touchpad, gyroscope, or
accelerometer, those specific controls will not output data.

Supported input groups include:

- D-pad buttons
- ABXY / face buttons
- Left and right stick button triggers
- Left and right stick X/Y position data
- Triggers and shoulder buttons
- System buttons
- Touchpad button
- Two-finger touchpad position data
- Motion sensor data, including accelerometer and gyroscope controls

The device panel provides mapping controls for each input group, including:

- MIDI mapping for buttons, triggers, sticks, touchpad, and motion controls
- MIDI velocity / volume amount mapping
- MIDI control enable/disable switches
- Ableton parameter mapping
- Per-control map toggle switches
- X/Y position mapping for sticks, triggers, and touchpad nodes
- Accelerometer X, Y, and Z parameter mapping
- Gyroscope X, Y, and Z parameter mapping

## Notes

- The `.amxd` file in `dist/` is the recommended file for users.
- The files in `src/` are included for reference and development.
- If a patcher or JavaScript dependency is missing after moving the project, check that the device was frozen or that all required files are included in the Max project path.

## Known Issues

- Controller support may depend on operating system, driver, browser/gamepad API behavior, and Max for Live environment.
- Motion sensor data is controller-dependent and may not be available on all devices.
- If the device does not receive input, reconnect the controller and reload the Max for Live device.

## Author

Created by Xinyue Sun.

## License

This project is licensed under the Creative Commons Attribution-NonCommercial
4.0 International License (CC BY-NC 4.0). You may share and adapt the project
with attribution for non-commercial purposes.

See [LICENSE](LICENSE).
