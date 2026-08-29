# Risk Radar

**Personalized home-risk intelligence for homeowners.**

Risk Radar takes a real property address, the owner's insurance claim/inspection PDFs, their property photos, and a short home-safety questionnaire, and turns all of it into a single explainable risk score (0–100) with a per-category breakdown, a prioritized fix plan, a historical hazard timeline, and a "what-if" simulator that shows how much the score would drop if you actually did the work.

Built for **WeHack 2026** by [@TamannaK24](https://github.com/TamannaK24), Anvi Siddabhattuni, Siri Kishore Dola, and Tramanh Trinh.

---

## Table of contents

- [The problem and the goal](#the-problem-and-the-goal)
- [What the app actually does](#what-the-app-actually-does)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Repository structure](#repository-structure)
- [The data pipeline: `final.json` → `risk.json`](#the-data-pipeline-finaljson--riskjson)
- [The scoring model](#the-scoring-model)
- [API reference](#api-reference)
- [Frontend routing and pages](#frontend-routing-and-pages)
- [Getting it running locally](#getting-it-running-locally)
- [Environment variables](#environment-variables)
- [Branches](#branches)
- [Known gaps and gotchas](#known-gaps-and-gotchas)

---

## The problem and the goal

Homeowners have no idea what their house's actual risk profile looks like until an insurer tells them — usually at renewal, usually as a premium increase, and never with an itemized reason. The information that *would* explain it is scattered across:

- **public parcel/hazard data** (FEMA flood zone, year built, construction type, local crime, storm history),
- **their own paperwork** (past claims, adjuster reports, inspection findings), sitting in PDFs nobody reads,
- **the physical house** (roof wear, cracked slab, corroded plumbing, missing smoke detectors), visible in photos,
- **what they've already mitigated** (alarms, leak detectors, shutters, generators), which nobody ever asks about.

**Goal:** collapse all four sources into one transparent score, and — critically — make it *actionable*. Every point in the score traces back to a named contribution ("roof remaining life ≤ 5 years: +20", "smart water shutoff valves: −12"), and every contribution maps to a fix the homeowner can actually do. The what-if simulator closes the loop: toggle a remediation, watch the score move.

The design brief was deliberately non-corporate — a dark, cinematic, "investigation dossier" aesthetic (the internal page names still carry the original *Nocturne* gallery/curator theme) so that reading your own risk report feels like reading an intelligence brief rather than an insurance form.

---

## What the app actually does

The user journey, end to end:

1. **Landing** — an animated door-opening sequence; clicking through enters the app.
2. **Auth** — sign up / sign in. Credentials live in `localStorage`; a `sessionStorage` flag gates routing so a stored user can't skip straight past auth into onboarding.
3. **Onboarding (property intake)** — a multi-step form:
   - **Address**: debounced autocomplete against the backend's parcel database (359 Dallas properties enriched with FEMA flood zone, crime stats, and storm history). Selecting one POSTs to `/addresses/select`, which snapshots the full parcel record into `final.json`. A Google Maps embed shows the selected parcel.
   - **Documents**: upload claim PDFs and inspection reports. Each file is stored under `backend/app/uploads/` with a `claim_`/`inspection_` prefix, then `/documents/extract-risk` sends the whole set to OpenAI for structured extraction.
   - **Blueprint / photos**: upload up to 12 property photos, extracted the same way via `/photos/extract-risk` (vision).
   - **Protection quiz**: nine "how many do you have?" questions — burglar alarms, exterior cameras, smoke detectors, monitored fire alarms, water leak detectors, smart shutoff valves, fire extinguishers, storm shutters, backup generators. POSTed to `/quiz`, written into `final.json`, and mirrored to MongoDB.
4. **Floor plan** (`GalleryPage`) — an interactive floor plan with risk pins per room, plus an embedded chatbot that answers questions grounded *only* in this property's extracted data.
5. **Risk Score** (`RiskScorePage`) — the master score, tier, and the six weighted subscores with their contribution trails.
6. **Fix plan** (`RiskActionPlanPage`) — the contributions re-sorted into a prioritized remediation list.
7. **Timeline** (`RiskTimelineDataPage`) — claims, inspections, and regional hazard events laid out chronologically.
8. **Simulator** (`InquiryEstate` → `RiskWhatIfSimulator`) — toggle remediations and watch the recomputed score.
9. **Settings** (`CuratorSettings`) — account panel and logout.

---

## Tech stack

### Frontend

| Piece | Choice | Why / notes |
|---|---|---|
| Framework | **React 19** | Function components + hooks throughout; no class components. |
| Language | **TypeScript 6** (`noEmit`, bundler resolution) | Types are checked by the editor/`tsc`; Vite transpiles without type-checking. |
| Build tool | **Vite 7** (`@vitejs/plugin-react`) | Dev server also acts as the API reverse proxy — see below. |
| Styling | **Tailwind CSS 4** via `@tailwindcss/vite` | v4's CSS-first config: the theme (custom `font-headline`/`font-label`, `surface-container-*`, `outline-variant`, `primary` tokens) is declared in `src/index.css`, not a `tailwind.config.js`. |
| Animation | **Motion 12** (`motion/react`, the Framer Motion successor) | Page transitions (`push` / `push_back` / `slide_up`), `AnimatePresence` gating, animated score gauges. |
| Icons | **lucide-react** | |
| Routing | **None — hand-rolled** | A `Screen` union type + `useState` switch in `App.tsx`. No React Router; the app is a single view stack with animated transitions. |
| State | **None — hand-rolled** | No Redux/Zustand/TanStack Query. Component-local `useState` + `fetch` in `useEffect` with `AbortController` cleanup. |
| Persistence | **`localStorage` / `sessionStorage`** | `src/lib/authStorage.ts` is the only wrapper. |
| Maps | **Google Maps Embed API** | Static iframe embed of the selected parcel. |

### Backend

| Piece | Choice | Why / notes |
|---|---|---|
| Framework | **Flask 3.1** with blueprints | One blueprint per domain (`addresses`, `claims`, `photos`, `quiz`, `risk`, `chatbot`), assembled in `create_app()`. |
| CORS | **flask-cors** | Wide-open `CORS(app)` — fine for a hackathon, not for production. |
| Database | **MongoDB** via **pymongo** | Database `riskdb`; collections `homes`, `questions`, `risk_reports`. |
| AI — extraction | **OpenAI Responses API** (`gpt-4.1-mini`, override via `OPENAI_EXTRACTION_MODEL`) | Called through raw `urllib` — no SDK dependency for this path. PDFs go as `input_file`, photos as `input_image`, both base64 data-URIs. Forced `json_object` output. |
| AI — chat | **OpenAI Chat Completions** (`gpt-4o-mini`) via the `openai` SDK | Separate path from extraction. |
| Config | **python-dotenv** + `.flaskenv` | `.flaskenv` pins `FLASK_RUN_PORT=5050` (port 5000 collides with macOS AirPlay Receiver). |
| Server-side state | **Flat JSON files** | `final.json` (accumulating property dossier) and `risk.json` (last computed score). There is no per-user database record — see [Known gaps](#known-gaps-and-gotchas). |

### Data

- `backend/dallas_359_with_flood_crime_storm.csv` — 359 Dallas parcels, 55 columns: parcel geometry/zoning/`yearbuilt`/`sqft`, FEMA (`fema_flood_zone`, `fema_sfha`, `fema_static_bfe`, `fema_zone_desc`), crime breakdown (burglary/arson/robbery/vandalism → `crime_total`, `crime_insurance_score`), and 5-year NOAA storm history (hail events + max size + damage USD, tornado events + max F-scale, wind events + max mph, flash-flood events → `storm_risk_score`).
- `backend/address.json` — the same dataset as JSON, loaded into MongoDB by `python -m app.db` and **also used as an automatic offline fallback** when Mongo is unreachable.

---

## Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│  Browser — React 19 SPA (Vite dev server :5173)                        │
│                                                                        │
│  App.tsx  ──gate──▶  AuthPage ──▶ OnboardingPage ──▶ app screens       │
│                                                       │                │
│    Floor plan · Risk Score · Fix plan · Timeline · Simulator · Settings│
└──────────────────────────────┬─────────────────────────────────────────┘
                               │  Vite dev-server proxy forwards
                               │  /addresses /claims /inspections /blueprints
                               │  /photos /quiz /documents /risk /final /api
                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Flask API (:5050)  —  create_app() registers 6 blueprints             │
│                                                                        │
│  addresses ─▶ address_service ─┬─▶ MongoDB  homes                      │
│                                └─▶ address.json  (fallback, 60s cooldown)│
│  claims/photos ─▶ document_risk_service ─▶ OpenAI Responses API        │
│  quiz ─▶ quiz_service ─▶ MongoDB questions                             │
│  risk ─▶ risk_score_service  (pure Python, deterministic)              │
│  chatbot ─▶ OpenAI Chat Completions (gpt-4o-mini)                      │
└──────────────────────────────┬─────────────────────────────────────────┘
                               ▼
              backend/final.json  ──▶  backend/risk.json
              (accumulated dossier)     (computed scores + audit trail)
```

Two design decisions are worth calling out:

**The Vite proxy is load-bearing.** Most frontend pages call `fetch('/risk')` with an empty base URL and rely on `vite.config.js`'s `server.proxy` to forward to `http://127.0.0.1:5050`. This keeps everything same-origin in dev. `OnboardingPage.tsx` is the exception — it defaults `API_BASE_URL` to `http://127.0.0.1:5050` explicitly. If you deploy the frontend as a static build, you need a real reverse proxy or `VITE_API_BASE_URL` set.

**Mongo failure is non-fatal for address lookup.** `address_service.py` wraps every Mongo query; on `PyMongoError` it marks Mongo unavailable for 60 seconds (`MONGO_FALLBACK_COOLDOWN_SECONDS`) and serves results from an `lru_cache`d read of `address.json` instead. Combined with `serverSelectionTimeoutMS=750`, this means the demo keeps working with the database down — which it did, during the hackathon.

---

## Repository structure

```
wehack26/
├── backend/
│   ├── .flaskenv                    # FLASK_APP=run:app, FLASK_RUN_PORT=5050
│   ├── .env                         # (gitignored) MONGO_URI, OPENAI_API_KEY
│   ├── run.py                       # entry point: app = create_app()
│   ├── requirements.txt
│   ├── address.json                 # parcel dataset (JSON) — Mongo seed + offline fallback
│   ├── dallas_359_with_flood_crime_storm.csv   # same data, source CSV, 55 cols
│   ├── final.json                   # accumulated property dossier (written by app)
│   ├── risk.json                    # last computed score + audit trail (written by app)
│   └── app/
│       ├── __init__.py              # create_app(), CORS, blueprint registration
│       ├── db.py                    # Mongo client, collections, JSON→Mongo seeder
│       ├── uploads/                 # (gitignored) claim_*/inspection_*/photo_*/blueprint_*
│       ├── routes/
│       │   ├── addresses.py         # GET /addresses, /addresses/search, /addresses/<id>
│       │   │                        # POST /addresses/select
│       │   ├── claims.py            # POST /claims, /documents/extract-risk
│       │   ├── photos.py            # POST /inspections, /blueprints, /photos,
│       │   │                        #      /photos/extract-risk
│       │   ├── quiz.py              # POST /quiz
│       │   ├── risk.py              # GET /risk, /final · POST /risk/calculate
│       │   └── chatbot.py           # POST /api/chat, /api/whatif · GET /api/suggestions
│       └── services/
│           ├── address_service.py       # Mongo lookup + address.json fallback + serialization
│           ├── document_risk_service.py # OpenAI extraction (PDFs + photos) → final.json
│           ├── quiz_service.py          # normalize → final.json + Mongo upsert
│           ├── risk_score_service.py    # the scoring engine (pure, deterministic)
│           ├── claim_service.py         # (empty placeholder)
│           └── photo_service.py         # (empty placeholder)
│
└── frontend/
    ├── index.html
    ├── vite.config.js               # React + Tailwind plugins, API proxy table
    ├── tsconfig.json
    ├── package.json
    └── src/
        ├── main.tsx                 # createRoot + StrictMode
        ├── index.css                # Tailwind v4 theme tokens, fonts, film-grain overlay
        ├── App.tsx                  # gate machine + TopBar + screen switch + transitions
        ├── types/navigation.ts      # Screen / TransitionType / NavigateFn
        ├── lib/authStorage.ts       # localStorage user + sessionStorage session flag
        ├── components/
        │   ├── RiskWhatIfSimulator.tsx      # live remediation simulator (wired)
        │   ├── InteractiveRiskSimulator.tsx # earlier standalone simulator (unwired)
        │   └── onboarding/
        │       ├── index.ts                      # barrel export
        │       ├── types.ts                      # PropertyAddress, DocumentUploads,
        │       │                                 # ProtectionQuizAnswers, payload builder
        │       ├── quizItems.ts                  # the 9 protection questions
        │       ├── PropertyAddressForm.tsx
        │       ├── DocumentsUploadForm.tsx
        │       ├── ProtectionQuizForm.tsx
        │       └── PropertyBlueprintUploadForm.tsx   # up to 12 photos
        └── pages/
            ├── LandingPage.tsx          # animated door entry
            ├── AuthPage.tsx             # login/signup switcher
            ├── LoginPage.tsx
            ├── SignUpPage.tsx
            ├── OnboardingPage.tsx       # 4-step intake; the main API integration point
            ├── GalleryPage.tsx          # floor plan + risk pins + grounded chatbot
            ├── RiskScorePage.tsx        # master score + 6 subscores
            ├── RiskActionPlanPage.tsx   # prioritized fix plan
            ├── RiskTimelineDataPage.tsx # data-driven timeline (wired)
            ├── RiskTimelinePage.tsx     # earlier static timeline (unwired)
            ├── InquiryEstate.tsx        # methodology + what-if simulator host
            ├── CuratorSettings.tsx      # account/settings + logout
            ├── DeepLedger.tsx           # earlier signal-log page (unwired)
            └── RestorationProjects.tsx  # earlier risk-breakdown page (unwired)
```

---

## The data pipeline: `final.json` → `risk.json`

`final.json` is the single accumulating dossier for the property being assessed. Four separate endpoints each write their own top-level key into it, merging rather than overwriting:

| Written by | Key(s) added |
|---|---|
| `POST /addresses/select` | `address`, `addressSavedAt` |
| `POST /documents/extract-risk` | `document_risk_extraction`, `document_risk_extraction_meta` |
| `POST /photos/extract-risk` | `photo_risk_extraction`, `photo_risk_extraction_meta` |
| `POST /quiz` | `quiz` |

**Extraction.** `document_risk_service.py` holds two large prompts. The document prompt instructs the model to act as a strict extraction engine over inspection reports and claim files, emitting a fixed JSON schema: `property`, `documents` (carrier, claim number, claim status, dates), `property_features`, `risk_factors`, `protective_features`, `claims_financials`, `summary_counts`, `notes`. Key rules baked into the prompt:

- normalize varied wording into a consistent snake_case `factor_key` ("foundation movement in bathroom" / "settlement observed near bathroom" → `bathroom_foundation_issue`);
- severity constrained to `low` / `moderate` / `high` / `unknown`;
- keep every occurrence with its evidence string, *and* maintain rolled-up `summary_counts`;
- explicitly risk-*reducing* statements go into `protective_features`, not `risk_factors`;
- never invent, never infer hidden damage, `null` for unknown.

The photo prompt is the vision analogue, restricted to visually-supported observations only.

**Scoring.** `risk_score_service.calculate_risk_scores()` reads `final.json`, computes six subscores, weights them into a master score, and writes the whole thing — including a per-subscore `details` array naming every individual contribution — to `risk.json`. It is pure and deterministic: no model call, no randomness. `GET /risk` recomputes on every request and serves with `Cache-Control: no-store`.

---

## The scoring model

Six subscores, each clamped to 0–100, combined by fixed weights (`SUBSCORE_WEIGHTS`):

| Subscore | Weight | Driven by |
|---|---|---|
| `roofWeatherScore` | 25% | Roof/hail/wind risk factors (12 × severity × count), high-severity roof findings in photos (+20 each), roof remaining life (≤5yr: +20, 6–10yr: +10), parcel `storm_risk_score` (scaled to 15). **Minus** storm shutters (×3) and backup generators (×2, capped 10). |
| `waterPlumbingScore` | 22% | Water/plumbing factors (14 × severity × count), photo water damage (+18 each), >3 combined water+plumbing findings (+10), outstanding claim reserve (+8). **Minus** leak detectors (×6) and smart shutoff valves (×12). |
| `fireElectricalScore` | 18% | Fire/smoke/electrical factors (14 × severity × count), missing smoke detectors (+15). **Minus** updated electrical panel (−10), smoke detectors (×2, cap 14), monitored fire alarms (×8), extinguishers (×4, cap 8). |
| `securityScore` | 15% | Prior theft/burglary losses (+20 each), security findings (+12 each), parcel `crime_insurance_score` (scaled to 20). **Minus** burglar alarms (×15) and exterior cameras (×5, cap 20). |
| `structuralScore` | 12% | Foundation/structural factors (18 × severity × count), slab moisture (+12), photo structural findings (15 × severity), `yearbuilt` < 1980 (+15) or 1980–1999 (+8), FEMA zone A/V (+15). |
| `claimsHistoryScore` | 8% | Open claim (+15), closed-partial (+10), closed-paid (+8), any claim within 12 months of the reference date (+5 each), repeated claims (×12), net payments >$30k (+10) or >$15k (+5). |

Severity multipliers: `high` 1.4, `moderate`/`medium` 1.1, `low` 0.8, `unknown` 1.0.

Master score → tier: **0–29** Low · **30–49** Moderate · **50–69** Elevated · **70–84** High · **85–100** Critical.

The quiz answers are the homeowner's lever — every deduction above comes from something they can install. Deductions are clamped so a subscore can never go negative.

`REFERENCE_DATE` is hard-coded to `2026-04-12` (the hackathon date) so "recent claim" windows stay reproducible in the demo.

> **Note:** `chatbot.py`'s `/api/whatif` endpoint uses a *second, different* scoring model — seven categories (`roof` .34, `water_damage` .29, `foundation` .12, `fire` .09, `theft` .06, `natural_disasters` .06, `maintenance` .04) with fixed per-action deltas. The `InquiryEstate` methodology page displays a *third* set of eight illustrative factor weights. These three were developed on different branches and never reconciled — the six-subscore model in `risk_score_service.py` is the real one.

---

## API reference

Base URL in development: `http://127.0.0.1:5050`

### Addresses

| Method | Path | Description |
|---|---|---|
| `GET` | `/addresses` | First 100 parcels, serialized. Falls back to `address.json`. |
| `GET` | `/addresses/search?q=` | Case-insensitive regex match on `parcel_address`, max 10 results. Returns `{id, label, street, city, state, zip}`. |
| `GET` | `/addresses/<id>` | Full parcel record by Mongo ObjectId. `404` if not found. |
| `POST` | `/addresses/select` | Body `{addressId}`. Snapshots the parcel into `final.json` under `address`. |

### Uploads and extraction

| Method | Path | Description |
|---|---|---|
| `POST` | `/claims` | Multipart `file`. Saved as `claim_<uuid>_<name>`. |
| `POST` | `/inspections` | Multipart `file`. Saved as `inspection_<uuid>_<name>`. |
| `POST` | `/blueprints` | Multipart `file`. Saved as `blueprint_<uuid>_<name>`. |
| `POST` | `/photos` | Multipart `file`. Saved as `photo_<uuid>_<name>`. |
| `POST` | `/documents/extract-risk` | Runs OpenAI extraction over **all** `claim_*`/`inspection_*` files in `uploads/`. |
| `POST` | `/photos/extract-risk` | Runs vision extraction over **all** `photo_*` files in `uploads/`. |

Filename prefixes are the routing mechanism — extraction globs the uploads directory by prefix, so the prefix is what decides which prompt a file gets.

### Quiz

| Method | Path | Description |
|---|---|---|
| `POST` | `/quiz` | Body `{responses: [{id, question, answer}]}`. Writes `final.json`, upserts to Mongo `questions`. Returns **207** if the file write succeeded but the Mongo sync failed. |

### Risk

| Method | Path | Description |
|---|---|---|
| `GET` | `/risk` | Recomputes and returns the full payload: `masterScore`, `riskTier`, `weights`, `subscores`, `details` (per-contribution audit trail), `generatedAt`. No-store. |
| `POST` | `/risk/calculate` | Same computation, returns a summary and persists `risk.json`. |
| `GET` | `/final` | Raw `final.json`. `400` if missing/invalid. |

### Chatbot

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/chat` | Body `{message, property_context}`. The context (score, categories, top drivers, address, quiz responses, document/photo summaries) is injected into a system prompt that constrains the model to that data only, under 100 words, plain English, no markdown. |
| `POST` | `/api/whatif` | Body `{action, categories, current_score}`. Applies fixed deltas from `SUGGESTION_IMPACTS`, returns before/after scores and the improvement. |
| `GET` | `/api/suggestions` | The 13 available remediation actions with labels and categories. |

---

## Frontend routing and pages

There is no router. `App.tsx` runs a two-level state machine:

**Gate** (`'auth' | 'onboarding' | 'app'`) decides whether you see the auth screens, the intake flow, or the app proper. On `origin/main` the gate initializes to `'auth'` unconditionally.

**Screen** (`'GALLERY' | 'ARCHIVE' | 'TIMELINE' | 'RESTORATION' | 'INQUIRY' | 'SETTINGS'`) selects the app page. The identifiers are legacy from the original gallery theme, so they don't match their labels:

| `Screen` | Nav label | Component |
|---|---|---|
| `GALLERY` | Floor plan | `GalleryPage` |
| `RESTORATION` | Risk Score | `RiskScorePage` |
| `ARCHIVE` | Fix plan | `RiskActionPlanPage` |
| `TIMELINE` | Timeline | `RiskTimelineDataPage` |
| `INQUIRY` | Simulator | `InquiryEstate` |
| `SETTINGS` | — (avatar button) | `CuratorSettings` |

Each nav entry carries a transition direction, fed to Motion's `AnimatePresence` for a spring-physics slide between screens.

---

## Getting it running locally

**Prerequisites:** Python 3.13, Node 18+, a MongoDB connection string, an OpenAI API key.

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/?retryWrites=true&w=majority
OPENAI_API_KEY=sk-...
OPENAI_EXTRACTION_MODEL=gpt-4.1-mini      # optional
```

Seed the parcel data into MongoDB (one time):

```bash
python -m app.db
```

Run the API:

```bash
flask run          # reads .flaskenv → run:app on port 5050
# or: python run.py   (Flask's default port 5000 — the frontend proxy expects 5050)
```

Sanity check: `curl http://127.0.0.1:5050/` → `Backend is running!`

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

The dev server proxies API paths to `127.0.0.1:5050` automatically. `npm run build` produces a static bundle; `npm run preview` serves it.

### Exercising the pipeline without the UI

```bash
curl "http://127.0.0.1:5050/addresses/search?q=BOEDEKER"
curl -X POST http://127.0.0.1:5050/addresses/select \
     -H "Content-Type: application/json" -d '{"addressId":"<id-from-search>"}'
curl -X POST http://127.0.0.1:5050/claims -F "file=@my_claim.pdf"
curl -X POST http://127.0.0.1:5050/documents/extract-risk
curl -X POST http://127.0.0.1:5050/quiz \
     -H "Content-Type: application/json" \
     -d '{"responses":[{"id":"burglar_alarms","question":"...","answer":1}]}'
curl http://127.0.0.1:5050/risk
```

---

## Environment variables

### `backend/.env` (gitignored)

| Variable | Required | Purpose |
|---|---|---|
| `MONGO_URI` | **yes** | `db.py` raises `RuntimeError` at import time without it — the app will not start. |
| `OPENAI_API_KEY` | for AI features | Used by both extraction and chat. Upload endpoints work without it; extraction returns `400`. |
| `OPENAI_EXTRACTION_MODEL` | no | Defaults to `gpt-4.1-mini`. |

### `frontend/.env` (gitignored)

| Variable | Required | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | no | Overrides the API base. Leave unset in dev to use the Vite proxy. |
| `VITE_API_PROXY_TARGET` | no | Proxy destination. Defaults to `http://127.0.0.1:5050`. |
| `VITE_GOOGLE_MAPS_API_KEY` | no | Maps Embed key. **A fallback key is currently hard-coded in `OnboardingPage.tsx`** — see below. |
| `DISABLE_HMR` | no | Set to `true` to disable hot reload. |

---

## Branches

`main` is the integration branch and carries the complete project. The rest are per-person working branches from the hackathon; several are stale, and a few accidentally committed `node_modules/`.

| Branch | Owner | Head | State |
|---|---|---|---|
| **`main`** | Tamanna K | merge of `5abaf99` "full project" (2026-04-21) + this README | **Canonical.** Everything merged: full backend (risk scoring, OpenAI extraction, chatbot), all wired frontend pages, Vite API proxy. |
| `tammybackend` | Tamanna K | `5abaf99` | Same code as `main`; `main` additionally carries this README. |
| `anvi` | Anvi Siddabhattuni | `7aeef88` "Merge tammybackend into anvi" | 4 ahead / 2 behind. UI work — the top-level risk timeline view, nav centering, landing-page contrast, settings refresh. Substantially merged into `main` already. |
| `contact` | Tramanh Trinh | `83f77ce` "contact page" | 11 ahead / 1 behind. Adds `ContactAgentsPage.tsx` (~275 lines) plus a `CONTACT` screen in the nav. **Never merged — this is the one branch with a feature `main` doesn't have.** |
| `tramanh` | Tramanh Trinh | `c7cbb97` "spy theme" | 37 ahead of the merge base but fully contained in `main`. The original dark/spy visual direction. Historical. |
| `tramanhfix` | Tramanh Trinh | `6832354` "blueprint" | 2 ahead / 1 behind. Blueprint-upload and `GalleryPage` layout iteration; a variant of what's already in `main`. |
| `siribackend` | Siri Kishore Dola | `5f717f1` "added chatbot and quiz endpoint" | 25 ahead / 3 behind. Where `chatbot.py` and the quiz endpoint originated; also a standalone `QuizPage.tsx`. The backend work landed in `main`; the branch also deletes a large committed `node_modules/` tree. |
| `Siri` | Siri Kishore Dola | `541c5b7` "merge" | 19 ahead / 9 behind. **A separate experimental line that never merged:** a monolithic `backend/app/risk.py` (~817 lines) and a `backend/testing/` harness — OpenCV photo experiments (`test_cv.py`, `debug_cv.py`, `split_grid.py`), 40 test photos, `test_photos.csv`, `test_results.csv`. Worth mining if the photo pipeline gets revisited. |

Two branches carry work that is **not** in `main`: `contact` (contact-agents page) and `Siri` (the OpenCV photo-analysis experiments).

> **Heads up if you cloned or branched before August 2026:** `main` was consolidated late, so an older local checkout can sit well behind. `git log --oneline main..origin/main` will tell you; `git pull` to catch up.

---

## Known gaps and gotchas

These are hackathon-scope compromises, listed so nobody rediscovers them the hard way.

**Security**

- A **Google Maps API key is hard-coded** as a fallback literal in `frontend/src/pages/OnboardingPage.tsx` and is in git history. It should be revoked and replaced with `VITE_GOOGLE_MAPS_API_KEY` only.
- **Authentication is cosmetic.** There is no backend auth — no password hashing, no tokens, no session validation. `authStorage.ts` stores a user object in `localStorage`; login "succeeds" if the typed email matches the stored one. Passwords are never checked. Every API endpoint is unauthenticated.
- `CORS(app)` allows all origins.
- Uploads have no size limit, no MIME validation, and no virus scanning; files land directly on disk.

**Architecture**

- **`final.json` and `risk.json` are global singletons.** The whole backend assesses exactly one property at a time — a second concurrent user overwrites the first's dossier. Multi-tenancy means moving this state into the `risk_reports` Mongo collection (which exists in `db.py` but is unused).
- Extraction endpoints process *every* matching file in `uploads/`, not just the newly uploaded one, so uploads accumulate across sessions and get re-extracted.
- `REFERENCE_DATE` is hard-coded to `2026-04-12`; recency logic drifts from real time.
- `claim_service.py` and `photo_service.py` are empty placeholder files.
- The root `requirements.txt` is a UTF-16-encoded stale duplicate of `backend/requirements.txt`; use the backend one.
- `.gitignore` covers `backend/app/uploads/`, but sample claim and inspection PDFs were committed before that rule landed and remain in history.

**Unwired code**

`DeepLedger.tsx`, `RestorationProjects.tsx`, `RiskTimelinePage.tsx`, and `InteractiveRiskSimulator.tsx` are all imported by nothing on `main`. They're earlier iterations superseded by `RiskActionPlanPage`, `RiskScorePage`, `RiskTimelineDataPage`, and `RiskWhatIfSimulator` respectively. Safe to delete once someone confirms nothing is being cannibalized from them.

**Reconciliation**

The three parallel scoring models described in [The scoring model](#the-scoring-model) should be collapsed into one. `risk_score_service.py` is the version to keep; `/api/whatif` should be rewritten to call it with modified inputs rather than maintaining its own weights.
