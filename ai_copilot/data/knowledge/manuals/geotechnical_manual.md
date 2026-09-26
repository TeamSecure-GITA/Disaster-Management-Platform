# Field Operation Manual: Geotechnical Landslide Early Warning
Version: 3.2
Target Sector: North Eastern Region (NER) India

## 1. Sensor Deployment Guidelines
- Install inclinometers at slip surface interface, minimum 3.0m deep.
- Pair pore-water piezometers with capacitive moisture probes.
- Maintain LoRaWAN packet heartbeat every 300 seconds during non-emergency periods, 15 seconds during amber/red alarms.

## 2. Trigger Threshold Protocols
- Level 1 (Yellow): Rain > 80mm in 24h OR Pore pressure > 35 kPa.
- Level 2 (Orange): Rain > 140mm in 24h AND Slope shear rate > 1.2 mm/hr.
- Level 3 (Red): Factor of Safety (FoS) < 1.0 OR Angular tilt displacement > 3.5 degrees.
