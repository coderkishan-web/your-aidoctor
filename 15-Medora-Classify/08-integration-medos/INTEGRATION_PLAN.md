# Medora Classify — Integration Plan

Medora Classify plugs into the existing Medora ecosystem **without breaking anything**. It is purely additive: new MCP tools, new Hugging Face artifacts, new optional API routes.

---

## 1. What it consumes from the rest of Medora

| Source | What Medora Classify reads | Purpose |
|---|---|---|
| Medora auth/session | User identity | Permission checks. |
| `13-Medora-Family/` permissions | Member/family/guardian/caregiver matrix | Decide whether a classification on a specific member is allowed. |
| `14-Medora-Connect/` vitals | Normalized `vital_readings` (temperature, SpO₂, HR, BP, weight) | Enrich `classify_illness` input automatically when the user opts in. |
| Existing Medora chatbot | Free-text patient/parent input | Fed into `extract_symptoms`. |

It uses these as **read-only** consumers. It does not alter any of those modules.

---

## 2. What it exposes to the rest of Medora

### 2.1 MCP server (primary surface)

Five tools, defined in `02-mcp/MCP_TOOL_CONTRACTS.md`:

```text
extract_symptoms
red_flag_check
classify_illness
recommend_next_data
explain_result
```

The MCP server can be consumed by:

- The existing Medora chatbot (acts as an agent calling the tools).
- Claude / Claude Code / any external MCP-aware agent.
- A clinician-side dashboard in Medora Family (Phase 2).

### 2.2 Optional HTTP routes (for non-MCP clients)

A thin HTTP wrapper under `/api/classify/*` mirrors each MCP tool for clients that don't speak MCP yet. The HTTP wrapper does not add any logic — it adapts schemas only.

```text
POST /api/classify/extract-symptoms
POST /api/classify/red-flag-check
POST /api/classify/classify
POST /api/classify/next-data
POST /api/classify/explain
```

Permission and audit behavior is identical to the MCP path.

### 2.3 Hugging Face artifacts (public surface)

```text
medora/medora-classify-public-seed
medora/medora-classify-triage-dataset      (access-controlled)
medora/medora-classify-symptom-extractor
medora/medora-classify-risk-model
medora/medora-classify-demo                (HF Space, no PHI)
```

External developers can use the public-seed dataset and the demo Space without any access to clinical data.

---

## 3. Where the code goes

The code lives in two places:

- **Training and model code:** a separate repository, `medora-classify-train`. This is what publishes models and datasets to Hugging Face.
- **Runtime MCP server + thin HTTP wrapper:** added under the existing Next.js / FastAPI app at `9-HuggingFace-Global/`.

Suggested runtime layout (designed here, not implemented in this PR):

```text
9-HuggingFace-Global/
├── app/api/classify/
│   ├── extract-symptoms/route.ts
│   ├── red-flag-check/route.ts
│   ├── classify/route.ts
│   ├── next-data/route.ts
│   └── explain/route.ts
├── lib/classify/
│   ├── mcp-client.ts            # talks to the Medora Classify MCP server
│   ├── permission-bridge.ts     # uses Medora Family permission service
│   └── connect-bridge.ts        # pulls vitals from Medora Connect
└── lib/services/
    └── classify-service.ts      # orchestrates extract → red flags → classify → explain
```

Plus the standalone MCP server (Python or TypeScript) under `medora-classify-train/src/mcp_server/`.

---

## 4. Non-destructive guarantees

- No existing file is modified by introducing this folder.
- No existing table is altered, renamed, or dropped.
- No existing API is changed.
- The current Medora chatbot keeps working unchanged. If Medora Classify is disabled, the chatbot simply doesn't have these tools.
- All new routes live under new namespaces (`/api/classify/*`).
- Feature-flagged at the MCP server boundary: turn the flag off → the tools become unavailable, nothing else changes.

---

## 5. Rollout strategy

```text
Phase 0  Land documentation in 15-Medora-Classify/    (this folder)
Phase 1  Stand up the MCP server with mock models     (smoke tests, contracts only)
Phase 2  Train extractor + risk model on Level-1 data, publish to HF
Phase 3  Wire the MCP server into the existing Medora chatbot behind a flag
Phase 4  Expose HTTP wrapper routes under /api/classify/*
Phase 5  Begin clinician-supervised pilot with Level-2 data collection
Phase 6  Promote to decision support for clinicians (still flagged)
Phase 7  Public Hugging Face Space demo with the public-seed model
```

Each phase corresponds to milestones in `09-roadmap/ROADMAP.md`.

---

## 6. Cross-module data flow

### Single classification call (logged, audited)

```text
Agent receives free-text user input
   ↓
Agent calls extract_symptoms(text)
   ↓
Medora Classify pulls vitals from Medora Connect (if user opted in)
   ↓
Agent calls red_flag_check(...)
   ↓
Agent calls classify_illness(...)   ← reads Medora Family permissions first
   ↓
Agent calls recommend_next_data(...) and asks one more question
   ↓
Agent calls classify_illness(...) again
   ↓
Agent calls explain_result(...)
   ↓
Agent presents triage + red flags + explanation + disclaimer
   ↓
Audit log entry is written for each tool call
```

### Clinician dashboard (Phase 6)

```text
Clinician opens patient case in Medora Family
   ↓
Medora Connect supplies vitals
   ↓
Medora Classify runs in advisory panel beside the chart
   ↓
Clinician confirms / rejects / annotates
   ↓
Annotation feeds the Level-2 dataset (with consent)
```

---

## 7. Reversibility

The whole module is reversible:

- Disable the MCP server feature flag → tools return 404, agent falls back to no-tool behavior.
- Drop the new tables (none required at the runtime layer beyond audit logs) → no impact on existing data.
- Remove `lib/classify/` and `app/api/classify/*` → existing services keep working.
- Delete the `15-Medora-Classify/` documentation folder → other modules are unaffected.

That is what "additive only" means in practice for Medora Classify, exactly mirroring the contract used in `14-Medora-Connect/`.

---

## 8. Cross-references

- [`../13-Medora-Family/README.md`](../13-Medora-Family/README.md) — family permission and consent rules.
- [`../14-Medora-Connect/README.md`](../14-Medora-Connect/README.md) — normalized vitals consumed by Medora Classify.
- [`../14-Medora-Connect/04-security/OAUTH_AND_PRIVACY.md`](../14-Medora-Connect/04-security/OAUTH_AND_PRIVACY.md) — privacy guarantees inherited by Classify when it reads vitals.
- This folder's own `02-mcp/MCP_TOOL_CONTRACTS.md`, `03-models/MODEL_ARCHITECTURE.md`, `07-safety/SAFETY_AND_COMPLIANCE.md`.
