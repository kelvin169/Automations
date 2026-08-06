# Automations

This repository contains a collection of personal experiments and prototypes:

- **App.js** – Node.js script that queries the WeatherStack API for current weather data.
- **Backend.py / BackendNew.py** – GNU Radio flowgraphs representing an SDR processing chain.
- **chat.py** – Placeholder script for plotting or chat‑related functionality (requires matplotlib and numpy).
- **config.json** – Configuration for an MQTT/Sparkplug bridge.
- **GPTRadio.cpp** and **TCP Connection.cpp** – C++ source examples for radio communication and TCP connections.
- **package.json** – Declares Node.js dependencies (Express, Axios, Material‑UI, React‑Router, CSV writer, GraphQL, Modbus serial).

## How to run

- Install Node.js dependencies: `npm install`
- Run the weather API script: `node App.js`
- Run the SDR backend (requires GNU Radio): `python Backend.py`
- Run the chat script: `python chat.py` (requires matplotlib and numpy)
- Compile C++ files (e.g., `g++ GPTRadio.cpp -o GPTRadio`) or use an Arduino toolchain if targeting microcontrollers.
- Test MQTT/Sparkplug configuration using an MQTT client.

## License

Feel free to use and modify the code for learning purposes.