# Polarized Capacitor Blast Simulator

A small educational web app that simulates connecting a polarized (electrolytic) capacitor with correct or reversed polarity, including simplified ESR, leakage, thermal rise, and failure conditions that trigger an on-screen "blast" effect.

Safety: This is a simulation. Do not attempt to reproduce failures in real life. Always read datasheets and observe safety practices.

## Run

Open a local server in the folder and visit the page:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/cap-blast-sim/
```

Or in some environments, simply open `index.html` in a modern browser.

## Model Notes

- Series network: Vs — R — node — (ESR + C) to ground
- Capacitor orientation affects leakage and stress limits, not the linear RC path.
- Integration: implicit Euler with fixed-point iteration for stable RC + ESR.
- Failure modes:
  - Reverse overvoltage beyond Max Reverse
  - Overvoltage beyond Rated Voltage
  - Overtemperature beyond Max Temperature
  - Overcurrent guardrail

Parameters are adjustable in the left panel.