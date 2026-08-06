# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- Install Node.js dependencies: `npm install`
- Run the weather API script: `node App.js`
- Run the SDR backend (GNU Radio): `python Backend.py` (requires GNU Radio installed)
- Run the chat script: `python chat.py` (requires matplotlib and numpy)
- Linting: No linting configuration present; consider adding ESLint for JavaScript/TypeScript and flake8/pylint for Python.
- Running tests: No test script defined; `npm test` currently outputs an error. Add appropriate test scripts (e.g., Jest for JS, pytest for Python) as needed.
- Building: No build steps defined. For a potential React frontend, you might add scripts like `npm start` or `npm run build` after setting up creating a React app.
- Compiling C++ files (e.g., GPTRadio.cpp, TCP\ Connection.cpp): Use an appropriate compiler (e.g., `g++ GPTRadio.cpp -o GPTRadio`) or Arduino toolchain if targeting microcontrollers.
- MQTT/Sparkplug configuration: Use an MQTT client to test connections defined in config.json (e.g., `mosquitto_sub -h broker.hivemq.com -t "topic"`).

## High-Level Architecture

This repository appears to be a collection of personal experiments and prototypes rather than a single cohesive application. The main components are:

- **App.js** – A simple Node.js script that queries the WeatherStack API for current weather data using the `request` library and logs the response.
- **Backend.py / BackendNew.py** – Identical GNU Radio flowgraphs representing an SDR (Software‑Defined Radio) processing chain. They read a raw signal file, apply filtering, synchronization, demodulation, error correction, and write decoded data to an output file. Dependencies include the `gnuradio` Python package.
- **config.json** – Configuration for an MQTT/Sparkplug bridge, defining Ethernet connections, nodes, and data tasks for IIoT telemetry (likely used with the Eclipse Sparkplug specification).
- **chat.py** – A placeholder script that imports `numpy` and comments out `matplotlib`; intended for plotting or chat‑related functionality.
- **GPTRadio.cpp** and **TCP Connection.cpp** – C++ source files, possibly targeting Arduino or embedded platforms, containing example code for radio communication and TCP connections.
- **package.json** – Declares a Node.js project with dependencies such as Express, Axios, Material‑UI, React‑Router, CSV writer, GraphQL, and Modbus serial. This suggests the intention to build a web‑based dashboard (React) with a Node.js/Express backend, though the frontend and server entry points are missing.
- **node_modules** – The installed Node.js dependencies listed in package.json.
- Miscellaneous files (`.mat`, `.c`, etc.) appear to be unrelated data files or experiments from other tools (MATLAB, C projects).

### Observations
- There is no unified entry point or build system tying these components together.
- No linting, testing, or continuous integration configurations are present.
- The codebase is sporadic; future work should clarify which components are intended to be integrated (e.g., using the Express backend to serve a React frontend that consumes weather data or SDR telemetry).
- To run the Python scripts, ensure the GNU Radio environment is set up (including gr‑blocks, filter, etc.).
- For the Node.js dependencies, run `npm install` once; consider adding start/build/test scripts to package.json for easier development.

When extending this repository, consider organizing code into clear directories (e.g., `src/backend`, `src/frontend`, `scripts`) and adding a README with setup instructions.