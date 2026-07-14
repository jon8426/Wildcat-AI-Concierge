# 🐱 Wildcat AI Concierge

**AI-Powered Campus Concierge for California State University, Chico**
*CSU Chico AI Summer Camp Prototype*

---

## Overview

The Wildcat AI Concierge is a conversational AI platform that gives students, faculty, staff, visitors, and community members a single natural-language interface to all CSU Chico campus services.

Instead of navigating dozens of departmental websites, users ask questions in plain English and receive accurate, source-cited answers — plus guided step-by-step workflows for complex processes like facility rentals, disability accommodations, and event registration.

**The AI behaves like a knowledgeable campus concierge, not a search engine.**

---

## Features

- **Conversational Q&A** — Ask anything in plain English: "I need an ASL interpreter", "Where should visitors park?", "How do I rent Laxson Auditorium?"
- **RAG (Retrieval-Augmented Generation)** — Every answer is grounded in official CSU Chico documents; the AI never makes up facts
- **Source Citations** — Every response includes source documents, URLs, and relevant departments
- **Guided Workflows** — Multi-step process cards for facility rentals, accommodations, parking permits, and event registration
- **Confidence Scoring** — Low-confidence answers automatically route to the appropriate campus department
- **Intelligent Department Routing** — Always surfaces the right office with phone, email, and location
- **Suggested Questions** — Quick-start chips on landing and chat pages
- **Dark Mode** — Full light/dark theme support
- **Accessible** — WCAG 2.1 AA compliant, keyboard navigation, screen reader support
- **Mobile Responsive** — Works on phones, tablets, and desktops

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Browser / Mobile                   │
│            Next.js 14 + React + TypeScript           │
│         Tailwind CSS  │  ShadCN UI  │  Dark Mode     │
└────────────────┬────────────────────────────────────┘
                 │  HTTP  (via Next.js rewrite proxy)
                 ▼
┌─────────────────────────────────────────────────────┐
│              FastAPI Backend  (Python 3.11)          │
│                                                      │
│  POST /api/v1/chat                                   │
│  GET  /api/v1/knowledge/suggested-questions          │
│  GET  /api/v1/knowledge/departments                  │
│  GET  /health                                        │
└────────┬──────────────────────┬───────────────────┘
         │                      │
         ▼                      ▼
┌──────────────────┐   ┌─────────────────────────┐
│   RAG Engine     │   │   Workflow Engine        │
│                  │   │                          │
│  DEV:  ChromaDB  │   │  facility_rental         │
│  PROD: OpenSearch│   │  accommodations          │
│                  │   │  parking_permit          │
│  DEV:  MiniLM    │   │  event_registration      │
│  PROD: Titan v2  │   │                          │
│                  │   │  Step-by-step cards      │
│  DEV:  Mock LLM  │   │  with status tracking    │
│  PROD: Claude    │   └─────────────────────────┘
└──────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│            Knowledge Base (Markdown / PDF)           │
│                                                      │
│  parking.md  │  dining.md  │  accessibility.md       │
│  facility_rental.md  │  campus_services.md           │
│  events.md  │  policies.md  │  campus_map.md         │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, ShadCN UI components |
| Backend | Python 3.11, FastAPI |
| AI (Dev) | sentence-transformers (all-MiniLM-L6-v2), ChromaDB |
| AI (Prod) | AWS Bedrock Claude 3.5 Sonnet, Titan Embeddings v2 |
| Vector DB (Dev) | ChromaDB (local persistent) |
| Vector DB (Prod) | Amazon OpenSearch Serverless |
| Storage (Prod) | Amazon S3 |
| Logging (Prod) | Amazon CloudWatch |

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+ (required for Next.js 14)
- npm 9+

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3.11 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env if needed (defaults work for dev mode)

# Start the API server
python3.11 -m uvicorn app.main:app --reload --port 8000
```

The backend will start at **http://localhost:8000**

On first startup, it will:
1. Initialize ChromaDB
2. Download the `all-MiniLM-L6-v2` embedding model (~90MB, one-time)
3. Index 149 document chunks from the knowledge base

API docs available at: http://localhost:8000/docs

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DEV_MODE` | `true` | Use local ChromaDB + mock LLM instead of AWS Bedrock |
| `AWS_REGION` | `us-west-2` | AWS region for Bedrock (prod only) |
| `AWS_ACCESS_KEY_ID` | — | AWS credentials (prod only) |
| `AWS_SECRET_ACCESS_KEY` | — | AWS credentials (prod only) |
| `BEDROCK_MODEL_ID` | `anthropic.claude-3-5-sonnet-20241022-v2:0` | Claude model ID |
| `BEDROCK_EMBEDDING_MODEL_ID` | `amazon.titan-embed-text-v2:0` | Titan embeddings model |
| `CHROMA_PERSIST_DIR` | `./data/chroma` | ChromaDB storage path |
| `CONFIDENCE_THRESHOLD` | `0.65` | Below this score, route to department contact |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed frontend origins |

---

## Using AWS Bedrock (Production Mode)

1. Set `DEV_MODE=false` in your `.env`
2. Add your AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
3. Ensure your IAM role has permissions for:
   - `bedrock:InvokeModel` on `anthropic.claude-3-5-sonnet-20241022-v2:0`
   - `bedrock:InvokeModel` on `amazon.titan-embed-text-v2:0`
4. Restart the backend

In production mode, the AI will use Claude 3.5 Sonnet to synthesize intelligent, natural-language answers from retrieved context.

---

## Knowledge Base

Documents live in `backend/data/knowledge_base/`. The RAG engine automatically indexes all `.md` and `.txt` files on startup.

**Included mock documents:**

| File | Content |
|------|---------|
| `parking.md` | Permit types, lot locations, fees, ADA parking, enforcement hours |
| `dining.md` | Dining locations, hours, meal plans, catering |
| `accessibility.md` | ARC services, accommodation process, ASL interpreters, captioning |
| `facility_rental.md` | Venue rates, request process, insurance requirements, Laxson Auditorium |
| `campus_services.md` | Health center, financial aid, housing, IT, registrar, library |
| `events.md` | Events calendar, student orgs, box office, space reservations |
| `policies.md` | Academic integrity, grade appeals, withdrawals, FERPA, ADA policy |
| `campus_map.md` | Building locations, shuttle routes, accessibility maps |

**To add new content:**
1. Drop a `.md` or `.pdf` file into `backend/data/knowledge_base/`
2. Delete `backend/data/chroma/` to force re-indexing
3. Restart the backend

---

## API Reference

### POST /api/v1/chat

Send a chat message and receive an AI response.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "Where do visitors park?" }
  ],
  "session_id": "optional-uuid"
}
```

**Response:**
```json
{
  "answer": "Visitors can park in...",
  "sources": [
    {
      "title": "Parking Guide",
      "url": "https://csuchico.edu/parking",
      "excerpt": "Visitor parking is available...",
      "type": "website"
    }
  ],
  "departments": [
    {
      "name": "University Parking Services",
      "phone": "(530) 898-5475",
      "email": "parking@csuchico.edu",
      "website": "https://www.csuchico.edu/parking/",
      "office": "Kendall Hall 130"
    }
  ],
  "workflow": null,
  "confidence": 0.82,
  "session_id": "abc123"
}
```

### GET /api/v1/knowledge/suggested-questions

Returns a list of suggested starter questions.

### GET /api/v1/knowledge/departments

Returns the full campus department directory.

### GET /health

Returns service health status and mode (dev/prod).

---

## Guided Workflows

When a question triggers a recognized workflow, the API returns a structured `WorkflowCard`:

| Workflow | Trigger Keywords | Steps |
|----------|-----------------|-------|
| Facility Rental | "rent", "facility", "venue", "Laxson" | 6 steps, 30+ days |
| Disability Accommodations | "accommodation", "disability", "ARC" | 5 steps, 1-2 weeks |
| Parking Permit | "parking permit", "permit", "parking pass" | 4 steps |
| Event Registration | "register event", "host event", "plan event" | 5 steps |

---

## Accessibility

- WCAG 2.1 AA compliant color contrast
- Full keyboard navigation
- Screen reader support (ARIA labels, live regions)
- High contrast dark mode
- Scalable text (respects browser font size settings)
- Accessible color palette (no information conveyed by color alone)
- Focus indicators on all interactive elements

---

## Docker

```bash
# Build and run both services
docker-compose up --build

# Backend only
docker-compose up backend

# Frontend only (requires backend running)
docker-compose up frontend
```

---

## Future Enhancements

- [ ] Spanish language support
- [ ] Voice interaction (Web Speech API)
- [ ] Persistent conversation history (DynamoDB)
- [ ] Concept3D interactive campus map integration
- [ ] Localist events API integration
- [ ] Facility reservation API integration
- [ ] Analytics dashboard
- [ ] Admin portal for knowledge base management
- [ ] Amazon OpenSearch Serverless for production vector search
- [ ] Multi-campus support (scalable to all 23 CSU campuses)
- [ ] Feedback loop for answer quality improvement

---

## Project Credits

Built as part of the **CSU Chico AI Summer Camp** prototype program.

- **Platform:** Wildcat AI Concierge
- **University:** California State University, Chico
- **AI Provider:** Amazon Bedrock (Claude 3.5 Sonnet + Titan Embeddings)
- **Stack:** Next.js · FastAPI · LlamaIndex · ChromaDB · Tailwind CSS

---

*This is a prototype application. Information is based on mock data and should not be relied upon for official university guidance. Always verify with the appropriate CSU Chico department.*
