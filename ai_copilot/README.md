# Disaster Management AI Copilot

An intelligent multimodal decision-support copilot designed for emergency responders, disaster managers, and public safety officials during natural and human-induced hazards.

---

## 🌟 Key Capabilities

1. **Multimodal Inputs**: Accepts natural language text, voice transcripts/audio, disaster site images, and emergency situational PDFs/documents.
2. **Intent Classification & Routing**: Classifies queries into domain-specific disaster intents (e.g. Risk Assessment, Shelter Allocation, Responders Dispatch, Evacuation Planning, Hazard Simulations, and Emergency Actions).
3. **Context Engine & State Management**: Maintains dynamic situational awareness across user roles, geolocations, active incidents, and timeline updates.
4. **Grounded RAG & Knowledge Retrieval**: Integrates standard operating procedures (SOPs), government disaster management guidelines, and disaster documentation with citations.
5. **Tool Orchestration**: Autonomous and human-in-the-loop tool execution for weather forecasts, seismic/soil sensor telemetry, GIS routing, shelter availability, and ML hazard predictions.
6. **Safety & Hallucination Guardrails**: Multi-tier policy enforcement requiring human confirmation before high-stakes emergency commands (e.g., mass evacuations or resource rerouting).

---

## 🚀 Quickstart

### Prerequisites
- Python 3.10+
- virtualenv

### Installation

```bash
cd ai-copilot
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Running the API Server

```bash
uvicorn api.router:app --host 0.0.0.0 --port 8001 --reload
```

Interactive OpenAPI docs will be available at: `http://localhost:8001/docs`.

### Running Tests

```bash
pytest tests/ -v
```

---

## 🏗️ Architecture

```
ai-copilot/
├── input/             # Text, Voice, Image, Document ingest and parsing
├── intent_router/     # Intent categorization and dispatch
├── context_manager/   # User, location, disaster state tracking
├── knowledge/         # RAG pipeline, SOPs, guidelines retriever
├── tools/             # Actionable tools (Prediction, Weather, Shelters, Responders, Maps)
├── orchestration/     # Tool selection, validation, and multi-step execution
├── reasoning/         # Chain-of-thought planner, hypothesis testing
├── safety/            # Confirmation checks, safety policy, hallucination guards
├── output/            # Structured multimodal output formatters
├── generation/        # LLM clients, prompt templates, structured output
├── memory/            # Conversation history and incident episodic memory
├── monitoring/        # Latency, token metrics, error auditing
├── schemas/           # Pydantic data schemas
└── api/               # FastAPI endpoints for chat, voice, multimodal
```
