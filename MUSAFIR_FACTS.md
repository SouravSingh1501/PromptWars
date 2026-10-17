# Musafir (PromptWars) Repository Analysis & Fact Sheet

This document provides evidence-based analysis and verified facts regarding the repository [https://github.com/SouravSingh1501/PromptWars](https://github.com/SouravSingh1501/PromptWars). Every assertion is cited with exact repository file paths, line numbers, or verified configuration properties. Where features or metrics are not present, they are explicitly noted as **Not verifiable from repo** or **Not implemented**.

---

## 1. Purpose and Status

### Purpose
Musafir (originally named NomadIQ) is an AI-powered travel itinerary planning and disruption management web application framed as an "Autonomous AI Travel Operating System" and "hyper-personalized AI travel concierge." The application provides an interface where users submit a destination, travel dates, travel preferences (transport mode, pacing, dietary requirements, accessibility needs, daily budget, interests), free-form text prompts, and an optional reference image ("Vision-to-Trip"). It calls the Google Gemini API to generate structured daily itineraries containing activity names, GPS coordinates, energy costs, budget estimates, and transport recommendations.
* **Citations**: 
  - `src/app/layout.tsx` (lines 8–15): Application title, description, and OpenGraph metadata.
  - `src/app/page.tsx` (lines 35–43): Landing page hero copy ("The Autonomous AI Travel Operating System").
  - `src/lib/gemini.ts` (lines 6–8): System prompt instructing the model to act as Musafir and generate strict JSON itineraries.
  - `src/app/planner/page.tsx` (lines 78–105): User input form for trip parameters and vision upload.

### Deployed Status
* **Deployed**: **Yes**, the application is deployed to Google Cloud Run.
  - **Service Name**: `webapp`
  - **GCP Project**: `midyear-respect-495705-d3`
  - **Region**: `europe-west1`
  - **Live URL**: `https://webapp-717089858944.europe-west1.run.app` (verified active via HTTP request; returns status 200 with runtime config).
  - **Container Configuration**: `Dockerfile` (lines 1–28) defines a multi-stage Node.js 20-slim production build exposing port 8080 and executing `npm start`.
  - **CI/CD Build Pipeline**: Google Cloud Build trigger `bfeafa76-b7c9-47d1-a678-5f0505366cc8` (`rmgpgab-webapp-europe-west1-SouravSingh1501-PromptWars--mawfp`), building the Docker image, pushing to Artifact Registry (`europe-west1-docker.pkg.dev/midyear-respect-495705-d3/cloud-run-source-deploy/promptwars/webapp`), and deploying to Cloud Run.

### Nature of Project (Prototype / Hackathon / Production)
* **Status**: **Hackathon Prototype**.
  - **GitHub Metadata**: The repository description on GitHub is explicitly set to `"Vibe Coding Hackathon 8th May 2026"`.
  - **Code Characteristics**: Key views rely on hardcoded demonstration data (e.g., `src/app/dashboard/page.tsx`, lines 14–40, 160–169), background disruption monitoring hooks are unmounted (`src/hooks/useLiveLoop.ts`), rule-based fatigue logic is isolated without active pipeline connections (`src/lib/fatigue.ts`), and build checks bypass ESLint and TypeScript validation (`next.config.js`, lines 15–20).

---

## 2. Data Sources

### External APIs Called
1. **Google Gemini API**
   - **Provider**: Google
   - **Endpoint**: `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent` (`src/lib/gemini.ts`, line 4).
   - **Fields Used**:
     - *Request Payload* (`src/lib/gemini.ts`, lines 12–28, 45–47): `contents[].parts` containing system prompt string, formatted user prompt string, and optional inline image base64 data (`mimeType: 'image/jpeg'`). Generation parameters: `temperature: 0.7`, `topP: 0.9`, `topK: 40`, `maxOutputTokens: 8192`, `response_mime_type: 'application/json'`.
     - *Response Parsing* (`src/lib/gemini.ts`, lines 49–76): Reads `candidates[0].content.parts[0].text`. Extracts `trip_summary` (`fatigue_score`, `budget_status`, `total_activities`, `destination`), `daily_itinerary` (`day`, `date`, `theme`, `activities` with GPS coordinates, costs, energy requirements, and categories), `transportation_plan`, and `live_adaptations`.
   - **Frequency & Fetch Mode**: On-demand real-time HTTP POST initiated when a user submits the planner form (`src/app/planner/page.tsx`, line 61; `src/hooks/useMusafirAI.ts`, line 37) or requests plan adaptation (`src/hooks/useMusafirAI.ts`, line 90).

2. **Google Maps Distance Matrix API**
   - **Provider**: Google
   - **Endpoint**: `https://maps.googleapis.com/maps/api/distancematrix/json` (`src/lib/google-maps.ts`, lines 76–78).
   - **Fields Used**: Query params: `origins`, `destinations`, `mode`, `departure_time=now`, `key`. Reads `rows[].elements[].status`, `duration.value` (seconds), `distance.value` (meters), and `duration_in_traffic.value` (seconds) (`src/lib/google-maps.ts`, lines 86–90).
   - **Frequency & Fetch Mode**: On-demand real-time HTTP GET triggered via `/api/v1/traffic/monitor` (`src/app/api/v1/traffic/monitor/route.ts`, line 22). (Designed for 20-minute client polling in `src/hooks/useLiveLoop.ts`, line 13, but the hook is unmounted in UI).

3. **Google Maps JavaScript API (Client SDK)**
   - **Provider**: Google
   - **Script URL**: `https://maps.googleapis.com/maps/api/js?key=${googleMapsKey}&libraries=places,geometry` (`src/app/layout.tsx`, line 45).
   - **Fields Used**: Consumed client-side by `MapView.tsx` (`src/components/ui/MapView.tsx`, lines 32–60) via global `window.google.maps` to construct interactive maps, pins, and polyline paths for activities.
   - **Frequency & Fetch Mode**: Loaded dynamically on client page render.

4. **Google Maps Directions API & Places Text Search API (Unused)**
   - **Provider**: Google
   - **Endpoints**: `https://maps.googleapis.com/maps/api/directions/json` (`src/lib/google-maps.ts`, line 34) and `https://maps.googleapis.com/maps/api/place/textsearch/json` (`src/lib/google-maps.ts`, line 110).
   - **Status**: Helper functions `getDirections` and `searchNearbyPlaces` are defined in the library, but are **never called anywhere else in the application**.

5. **Firebase Authentication & Cloud Firestore SDK**
   - **Provider**: Google Firebase
   - **Fields Used**: Google Auth profile fields (`uid`, `displayName`, `email`, `photoURL`) via `GoogleAuthProvider` popup (`src/lib/firebase.ts`, lines 81–85). Reads and writes to Firestore `users/{uid}` document.
   - **Frequency & Fetch Mode**: Event-driven real-time on user authentication state change (`src/hooks/useAuth.ts`, lines 11–24).

6. **Weather APIs**
   - **Provider**: **None**. No external weather API is integrated or called.
   - **Status**: While `WeatherDisruptionHUD` exists (`src/components/ui/WeatherDisruptionHUD.tsx`, lines 8–17), it receives static hardcoded demo properties in `src/app/dashboard/page.tsx` (lines 160–169: `city="Tokyo"`, `temp={22}`, `condition="Light Rain"`).

---

## 3. Pipeline Architecture

Every backend processing stage runs inside Next.js API route handlers hosted on Google Cloud Run. There are no offline ETL jobs, no Cloud Scheduler crons, and no Pub/Sub consumers.

```
[User Browser]
   │
   ├─► HTTP POST /api/v1/itinerary/generate ──► Cloud Run ──► Gemini 1.5 Flash ──► Formatted Itinerary JSON
   │
   ├─► HTTP POST /api/v1/itinerary/adapt    ──► Cloud Run ──► Gemini 1.5 Flash ──► Disruption Shadow Plan JSON
   │
   ├─► HTTP GET  /api/v1/traffic/monitor   ──► Cloud Run ──► Google Maps Matrix API ──► Traffic Delay JSON
   │
   └─► Firebase Web SDK ───────────────────► Cloud Firestore (users collection)
```

### Stage-by-Stage Breakdown

1. **Itinerary Generation Pipeline**
   - **Trigger**: HTTP POST request from user clicking "Generate Hyper-Personalized Plan" (`src/app/planner/page.tsx`, lines 57–66; `src/hooks/useMusafirAI.ts`, lines 37–41).
   - **Runtime Host**: Google Cloud Run (`src/app/api/v1/itinerary/generate/route.ts`).
   - **Reads**: Request body (`destination`, `startDate`, `endDate`, `prompt`, `imageBase64`, `preferences`). Reads `GEMINI_API_KEY` from container environment variables (`src/lib/gemini.ts`, line 42).
   - **Transforms**:
     1. Injects defaults for missing preferences (`route.ts`, lines 14–22).
     2. Formats user prompt text string (`src/lib/gemini.ts`, line 45).
     3. Assembles multi-part payload with system instructions and optional image (`src/lib/gemini.ts`, lines 12–28).
     4. Dispatches request to Gemini REST API (`src/lib/gemini.ts`, line 47).
     5. Strips markdown fences via `clean()` and parses JSON (`src/lib/gemini.ts`, lines 30–34).
     6. Normalizes energy levels, generates fallback activity IDs, and structures transport plans (`src/lib/gemini.ts`, lines 55–76).
   - **Writes**: Returns HTTP 200 JSON to browser client. The client writes the response strictly to React component state (`src/hooks/useMusafirAI.ts`, lines 48–56). It is not persisted to any database.

2. **Disruption Adaptation Pipeline**
   - **Trigger**: HTTP POST request (`src/app/api/v1/itinerary/adapt/route.ts`, lines 6–21; `src/hooks/useMusafirAI.ts`, lines 90–94).
   - **Runtime Host**: Google Cloud Run.
   - **Reads**: `tripId`, `disruption` object (type, severity, details), `currentLocation`, `currentDay`, `currentDayItinerary`.
   - **Transforms**: Formats disruption prompt, invokes Gemini with `ADAPT_PROMPT`, and parses the replacement plan (`src/lib/gemini.ts`, lines 79–91).
   - **Writes**: Returns JSON response with `adaptedDay` and `adaptation` log. *(Note: `adaptedDay` echoes `{ ...currentDay }` without merging the parsed replacement activities; see Section 10).*

3. **Traffic Monitoring Pipeline**
   - **Trigger**: HTTP GET request (`src/app/api/v1/traffic/monitor/route.ts`, lines 6–34).
   - **Runtime Host**: Google Cloud Run.
   - **Reads**: Query params `originLat`, `originLng`, `destLat`, `destLng`. Reads `GOOGLE_MAPS_SERVER_KEY` or `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
   - **Transforms**: Queries Google Maps Distance Matrix API (`src/lib/google-maps.ts`, lines 76–80), computes duration, distance, and traffic delay (`trafficDuration - duration`), and sets `hasSignificantDelay: delay > 15` (`route.ts`, lines 21–27).
   - **Writes**: Returns HTTP 200 JSON with delay statistics.

4. **User Profile Ingestion Pipeline**
   - **Trigger**: Client-side Google Sign-In popup in browser (`src/lib/firebase.ts`, lines 81–85).
   - **Runtime Host**: Client browser executing Firebase Web SDK directly against Google Firebase servers.
   - **Reads**: Firebase Auth User object (`src/hooks/useAuth.ts`, lines 12–16).
   - **Transforms**: Merges default user preferences (`src/lib/firebase.ts`, lines 104–111) with user profile.
   - **Writes**: Creates or updates document in Cloud Firestore at `users/{uid}` (`src/lib/firebase.ts`, lines 122, 126).

---

## 4. Firebase / NoSQL Usage

The application uses Google Cloud Firestore configured in `src/lib/firebase.ts`.

### Collections and Documents
1. **`users` Collection**
   - **Document Path**: `users/{uid}` (`src/lib/firebase.ts`, line 101).
   - **Stored Schema**: `MusafirUser` interface (`src/lib/types.ts`, lines 6–13):
     - `uid` (string)
     - `displayName` (string)
     - `email` (string)
     - `photoURL` (optional string)
     - `preferences`: Object containing `transport`, `diet`, `pace`, `accessibility`, `budgetPerDay`, and `interests` (`src/lib/firebase.ts`, lines 104–122).
     - `createdAt` (ISO timestamp string)
   - **Active Usage**: **Yes**. Written when user signs in via Google OAuth (`src/hooks/useAuth.ts`, lines 15–16).

2. **`trips` Collection**
   - **Document Path**: `trips/{tripId}` (`src/lib/firebase.ts`, line 139).
   - **Stored Schema**: `Trip` interface (`src/lib/types.ts`, lines 137–148):
     - `id`, `ownerId`, `title`, `destination`, `startDate`, `endDate`, `status`, `summary`, `dailyItinerary`, `createdAt`, `updatedAt`.
   - **Active Usage**: **Not actively used**. CRUD helpers (`saveTrip`, `getTrip`, `getUserTrips`, `subscribeTripUpdates` in `src/lib/firebase.ts`, lines 138–164) exist, but are **never invoked** by the planner page or dashboard. Generated trips remain in ephemeral React state.

3. **`alerts` Collection**
   - **Document Path**: `alerts/{alertId}` (`src/lib/firebase.ts`, line 169).
   - **Stored Schema**: `TripAlert` interface (`src/lib/types.ts`, lines 15–23):
     - `id`, `tripId`, `type`, `status`, `message`, `suggestedAlternative`, `createdAt`.
   - **Active Usage**: **Not actively used**. Functions `createAlert` and `subscribeTripAlerts` (`src/lib/firebase.ts`, lines 168–182) are never called in the active UI.

---

## 5. Gemini Usage

* **Model & Version**: `gemini-1.5-flash` via Google Generative Language REST API v1 (`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent`) (`src/lib/gemini.ts`, line 4).
* **Execution Path**: Server-side runtime execution inside Next.js Route Handlers (`src/app/api/v1/itinerary/generate/route.ts` and `src/app/api/v1/itinerary/adapt/route.ts`).
* **Purposes**:
  1. *Itinerary Generation* (`generateItinerary`, `src/lib/gemini.ts`, lines 41–77): Generates full trip schedules, daily themes, activities, GPS locations, energy requirements, and budgets.
  2. *Disruption Shadow Planning* (`adaptItinerary`, `src/lib/gemini.ts`, lines 79–91): Formulates plan adjustments and alternative activities when travel disruptions are reported.
* **Driven by Gemini, Rules, or Both?**:
  - The itinerary recommendation and fatigue calculations are **driven entirely by Gemini via prompt engineering**.
  - System instructions in `src/lib/gemini.ts` (lines 6–8) dictate the logic:
    > *"RULES: Every activity needs real place names, GPS coords, energy_requirement (Low/Medium/High), energy_cost (0-30). Respect transport/pace/diet/accessibility preferences. Insert rest when energy>70. Keep budget realistic. OUTPUT strict JSON..."*
  - Although a separate rule-based fatigue module exists in `src/lib/fatigue.ts` (containing deterministic algorithms like `optimizeDayForFatigue` and `calculateDailyEnergy`), **it is not imported or executed anywhere in the generation pipeline**. The entire schedule and fatigue distribution are generated directly by Gemini.

---

## 6. Recommendation Logic

### Inputs
* **User Parameters** (`src/app/planner/page.tsx`, lines 31–41, 57–66; `src/lib/types.ts`, lines 82–97):
  - `destination`: Destination city/country (string)
  - `startDate`, `endDate`: Trip duration dates (strings)
  - `prompt`: Free-form user notes or vibe preferences (string)
  - `imageBase64`: Base64 JPEG data from uploaded image for visual destination extraction (optional string)
  - `preferences.transport`: `'walking' | 'public-transit' | 'two-wheeler' | 'car' | 'bicycle'`
  - `preferences.pace`: `'relaxed' | 'moderate' | 'intense'`
  - `preferences.accessibility`: Wheelchair / step-free required (boolean)
  - `preferences.budgetPerDay`: Target budget in USD (number)
  - `preferences.diet`: Dietary preferences array (string[])
  - `preferences.interests`: Specific interest tags array (string[])

### Outputs
* **Generated Schedule** (`src/lib/types.ts`, lines 99–135):
  - `tripSummary`: `fatigueScore` (0–100), `budgetStatus` (`'Healthy' | 'Warning' | 'Over'`), `totalActivities` (count), `destination` (string).
  - `dailyItinerary`: Array of days containing `day`, `date`, `theme`, `activities` (time, endTime, place name, description, energy requirement, energy cost, lat/lng, address, category, cost, accessibility score), `transportation` segments, `totalEnergyCost`, and `totalEstimatedCost`.
  - `transportationPlan`: High-level transport recommendations with optimization reasons.
  - `liveAdaptations`: Array of runtime disruption adaptation objects.

### Production Mechanism
1. Inputs are concatenated into a structured user prompt string (`src/lib/gemini.ts`, line 45).
2. The payload is sent with `SYSTEM_PROMPT` to Gemini 1.5 Flash using structured output mode (`response_mime_type: 'application/json'`) (`src/lib/gemini.ts`, lines 20–26).
3. The response text is cleaned of code blocks, parsed as JSON, and typed into the response interface (`src/lib/gemini.ts`, lines 30–34, 55–76).
4. Results are presented on the planner page via `MapView` and daily timeline cards (`src/app/planner/page.tsx`, lines 228–308).

---

## 7. Tech Stack

All versions are cited directly from `package.json` (lines 14–38) and repository configuration:

| Category | Package / Tool | Version | File & Line Reference |
| :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | `>=20.0.0` | `package.json`, line 6 |
| **Framework** | Next.js (App Router) | `15.1.0` | `package.json`, line 21 |
| **Core Libraries** | React | `^18.3.1` | `package.json`, line 22 |
| | React DOM | `^18.3.1` | `package.json`, line 23 |
| **Language** | TypeScript | `^5.6.0` | `package.json`, line 28 |
| **Styling** | Tailwind CSS | `^3.4.14` | `package.json`, line 25 |
| | PostCSS | `^8.4.47` | `package.json`, line 26 |
| | Autoprefixer | `^10.4.20` | `package.json`, line 27 |
| **Animation & 3D** | Framer Motion | `^11.11.0` | `package.json`, line 19 |
| | Three.js | `^0.170.0` | `package.json`, line 24 |
| | @react-three/fiber | `^8.17.0` | `package.json`, line 17 |
| | @react-three/drei | `^9.114.0` | `package.json`, line 16 |
| **Icons** | Lucide React | `^0.460.0` | `package.json`, line 20 |
| **Database & Auth**| Firebase SDK | `^11.10.0` | `package.json`, line 18 |
| **AI SDK** | @google/generative-ai | `^0.21.0` | `package.json`, line 15 *(REST fetch used in code)* |
| **Type Definitions**| @types/google.maps | `^3.64.0` | `package.json`, line 31 |
| | @types/node | `^22.0.0` | `package.json`, line 32 |
| | @types/react | `^18.3.0` | `package.json`, line 33 |
| | @types/react-dom | `^18.3.0` | `package.json`, line 34 |
| | @types/three | `^0.170.0` | `package.json`, line 35 |
| **Linting** | ESLint | `^8.0.0` | `package.json`, line 36 |
| | eslint-config-next | `latest` | `package.json`, line 37 |
| **Infrastructure** | Docker | Node 20-slim | `Dockerfile`, lines 1, 18 |
| | Google Cloud Run | Managed | Cloud Run Service `webapp` |
| | Google Cloud Build | Cloud Builders | Trigger `bfeafa76-b7c9-47d1-a678-5f0505366cc8` |

---

## 8. Engineering Practices

### Tests
* **Existing Tests**: **None**. Zero test files (`*.test.*`, `*.spec.*`, or `__tests__/`) exist in the repository.
* **Test Runners**: No test framework (such as Jest, Vitest, Cypress, or Playwright) is installed in `package.json`. No test execution script is defined in `package.json` (`scripts` contains only `dev`, `build`, `start`, and `lint`).

### Build Validation & Static Analysis
* **ESLint**: Disabled during production builds (`next.config.js`, lines 15–17: `eslint: { ignoreDuringBuilds: true }`). Running `npm run lint` manually fails with exit code 1 because no `.eslintrc.json` or ESLint configuration file exists in the repository.
* **TypeScript Checking**: Compilation type errors are explicitly ignored during production builds (`next.config.js`, lines 18–20: `typescript: { ignoreBuildErrors: true }`).

### Error Handling
* **API Handlers**: API routes (`/api/v1/itinerary/generate`, `/api/v1/itinerary/adapt`, `/api/v1/traffic/monitor`) wrap execution in `try...catch` blocks and return JSON payloads with status 400 (validation failure) or 500 (internal server failure) (`src/app/api/v1/itinerary/generate/route.ts`, lines 26–30; `src/app/api/v1/traffic/monitor/route.ts`, lines 30–33).
* **Client Hooks**: UI state reflects errors via mascot animations (`mascotState: 'error'`) and error toasts with automatic timeouts (`src/hooks/useMusafirAI.ts`, lines 64–76).
* **Setup Guard**: `src/components/layout/SetupGuard.tsx` (lines 7–44) displays a blocking configuration screen if keys are missing during development, but line 11 explicitly bypasses it in production (`if (isConfigured || process.env.NODE_ENV === 'production') return <>{children}</>;`).

### Logging and Monitoring
* **Server Logging**: Limited to unformatted `console.error` calls in catch blocks (e.g., `console.error('[itinerary/generate]', error)` in `route.ts`, line 27). No structured logging framework (Pino/Winston) or APM integration (Sentry/Datadog) is present.
* **Client Analytics**: Initializes Firebase Analytics conditionally in supported browsers (`src/lib/firebase.ts`, lines 59–64) targeting measurement ID `G-GXHETRB5FF`.
* **Build Logs**: Google Cloud Build logs output to Google Cloud Logging (`logging: CLOUD_LOGGING_ONLY`).

### Secret Handling
* **Server Secrets**: Environment variables (`GEMINI_API_KEY`, `GOOGLE_MAPS_SERVER_KEY`) are read strictly within server route handlers (`src/lib/gemini.ts`, line 42; `src/lib/google-maps.ts`, line 7).
* **Client Secret Exposure & Injection**: Public configuration values (`FIREBASE_*` credentials and `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`) are dynamically injected into the client HTML as `window.__MUSAFIR_CONFIG__` (`src/app/layout.tsx`, lines 34–43).
* **Repository Sanitation**: `.env.local` is listed in `.gitignore` (line 3). In commit `bdf93e9`, `.env.local` was accidentally added to git history, then promptly removed in commit `da8d177`.

### CI/CD Pipeline
* Continuous deployment is managed via Google Cloud Build trigger `bfeafa76-b7c9-47d1-a678-5f0505366cc8` (`rmgpgab-webapp-europe-west1-SouravSingh1501-PromptWars--mawfp`).
* Push events to branch `^main$` on `SouravSingh1501/PromptWars` automatically execute a 3-step pipeline:
  1. `docker build --no-cache -t europe-west1-docker.pkg.dev/midyear-respect-495705-d3/cloud-run-source-deploy/promptwars/webapp:$COMMIT_SHA . -f Dockerfile`
  2. `docker push europe-west1-docker.pkg.dev/midyear-respect-495705-d3/cloud-run-source-deploy/promptwars/webapp:$COMMIT_SHA`
  3. `gcloud run services update webapp --platform=managed --image=... --region=europe-west1 --quiet`
* There are no GitHub Actions workflows present in the repository (no `.github/workflows` directory).

---

## 9. Measurements

* **Performance Numbers**: **None recorded in repo**.
* **Latency Benchmarks**: **None recorded in repo**.
* **Data Volumes**: **None recorded in repo**.
* **Accuracy / Evaluation Metrics**: **None recorded in repo**.
* **Hardcoded Constants in Code**:
  - `POLL_INTERVAL`: `1200000` ms (20 minutes) (`src/hooks/useLiveLoop.ts`, line 13)
  - `FATIGUE_THRESHOLD`: `70` (`src/lib/fatigue.ts`, line 6)
  - `bodySizeLimit`: `'10mb'` (`next.config.js`, line 11)
  - Demo metrics in dashboard: `fatigue: 62`, `spent: 340`, `limit: 800` (`src/app/dashboard/page.tsx`, lines 21, 23).

---

## 10. Limitations

The repository contains several acknowledged gaps, unreferenced modules, and incomplete implementations:

1. **Unmounted Disruption Monitoring Loop**:
   - `src/hooks/useLiveLoop.ts` defines a background polling loop checking `/api/v1/traffic/monitor` every 20 minutes (`POLL_INTERVAL = 20 * 60 * 1000`, lines 13, 65). However, `useLiveLoop` is **never imported or called in any page or component**.
2. **Incomplete Disruption Adaptation Handler**:
   - In `src/lib/gemini.ts` (lines 79–91), `adaptItinerary` parses Gemini's shadow plan, but returns `adaptedDay: { ...currentDay }` without updating or merging the adapted activities into the daily itinerary.
3. **Orphaned Fatigue Logic Engine**:
   - `src/lib/fatigue.ts` contains rule-based fatigue algorithms (`calculateDailyEnergy`, `getBatteryLevel`, `optimizeDayForFatigue`, `suggestLowEnergyAlternative`), but these are completely bypassed; itinerary fatigue calculations are produced solely via Gemini LLM prompts.
4. **Hardcoded Dashboard**:
   - `src/app/dashboard/page.tsx` (lines 14–40, 160–169) renders static mock data for Tokyo (`demoTrip`) rather than reading actual trips or alerts from Firestore.
5. **No Persistence for Generated Itineraries**:
   - `src/lib/firebase.ts` provides `saveTrip`, `getTrip`, and `getUserTrips` (lines 138–157), but the planner page (`src/app/planner/page.tsx`) never calls `saveTrip`. Itineraries exist only in volatile React component state and disappear on page refresh.
6. **Suppression of Type and Lint Checking**:
   - `next.config.js` (lines 15–20) disables both ESLint (`ignoreDuringBuilds: true`) and TypeScript compilation errors (`ignoreBuildErrors: true`).
7. **Motorcycle Mode Fallback**:
   - `src/lib/google-maps.ts` (line 15) notes: `'two-wheeler': 'driving', // Google doesn't have motorcycle mode; we use driving`.
8. **Map Script Dependency**:
   - `src/components/ui/MapView.tsx` (line 31) notes: `// Note: This assumes the Google Maps script is loaded via layout.tsx`.

---

## 11. Timeline and Authorship

### Commit History
* **First Commit**: `37d830a` on **2026-05-08 14:13:28 +0530** (`feat: complete AI Travel OS architecture with all build fixes`).
* **Last Commit**: `866e34e` on **2026-06-16 21:49:22 +0530** (`fix: force dynamic rendering of layout to read runtime environment variables`).
* **Total Commit Count on `main`**: **26 commits**.
* **Active Branches**: 1 (`main`).

### Contributors
* **`NomadIQ AI <nomad@ai-travel.os>`**: 25 commits on `main` (96.2%).
* **`SouravSingh1501 <101466536+SouravSingh1501@users.noreply.github.com>`**: 1 commit on `main` (`bdf93e9: Rename .env.local.example to .env.local`).

### AI Assistance vs. Hand-Written Analysis (`git blame`)
* Running `git blame` across all 2,842 lines of code in the `src/` directory reveals that **100% of lines (2,842 / 2,842) were authored by `NomadIQ AI`**:
  ```
  Name               Count
  ----------------   -----
  author NomadIQ AI  2842
  ```
* The human maintainer commit (`bdf93e9`) was an administrative file renaming operation for environment configuration (`.env.local.example` to `.env.local`), which was subsequently removed from tracking in commit `da8d177`.
* Combined with the explicit GitHub repository description (`"Vibe Coding Hackathon 8th May 2026"`), the git history confirms that the entire codebase was **generated with AI assistance** through an AI pair programming agent, with human interaction focused on project setup, repository administration, and environment provisioning.

---

## 12. Public Access

* **Repository Visibility**: **Public** (`"private": false`, verified via GitHub REST API query to `https://api.github.com/repos/SouravSingh1501/PromptWars`).
* **README Status**: **No README file exists**. There is no `README.md`, `README`, or documentation markdown file in the repository root or any subfolder (verified via `git ls-files` and git log history). Therefore, there is no README link to compare against the project.
