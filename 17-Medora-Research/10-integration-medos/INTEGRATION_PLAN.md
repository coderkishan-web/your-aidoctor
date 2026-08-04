# Medora Integration Plan

Medora Research & Development is added as a new optional module:

```text
17-Medora-Research/
```

It does not modify the existing Medora chatbot, Medora Family, Medora Connect, Medora Classify, or Medora Pathogen code.

---

## 1. Non-destructive guarantees

- No existing file, table, or API is modified by this folder.
- All new routes live under a new namespace: `/api/research/*`.
- All new tables are additive (see `12-sql/medora_research_schema.sql`).
- Patient PHI from Medora Family / Medora Connect **does not** flow into research projects automatically.
- The whole module can be disabled with a single feature flag and removed by deleting the folder + the `/api/research/*` routes.

---

## 2. Future UI entry point

```text
Medora sidebar
└── Research & Development
    ├── Research Dashboard
    ├── Literature Workspace
    ├── Disease / Target Workspace
    ├── Candidate Medicine Workspace
    ├── Simulation Lab
    ├── Experiment Registry
    ├── Evidence Matrix
    ├── Safety Review
    ├── Publication Studio
    └── Audit Log
```

The Research & Development entry is gated by a per-user role (`researcher`, `clinical_reviewer`, `lab_scientist`, `publication_lead`). Standard Medora users do not see it.

---

## 3. Future backend namespace

```text
/api/research/*
```

(See `04-api/API_CONTRACTS.md` for the full list.)

---

## 4. Persona delivery

Medora Research personas mirror the HomePilotAI persona layout (manifest + blueprint + agentic + dependencies + preview). They are designed to be:

- Loaded by [`kishan/HomePilot`](https://github.com/kishan/HomePilot) — the local-first GenAI host.
- Distributed via [`kishan/ollabridge-cloud`](https://github.com/kishan/ollabridge-cloud) as a persona delivery channel.
- Backed by an MCP server pattern that mirrors the General Doctor persona's `mcp-general-doctor` adapter, which itself sits on top of [`kishan/medical-mcp-toolkit`](https://github.com/kishan/medical-mcp-toolkit).

Suggested persona registry (separate package):

```text
medora-research-personas/
├── 01-evidence-researcher/
├── 02-clinical-safety-reviewer/
├── 03-target-biology-analyst/
├── 04-candidate-medicine-analyst/
├── 05-simulation-planner/
└── 06-publication-assistant/
```

Each subfolder uses the same `hpersona/{manifest, blueprint, dependencies, preview, assets}` structure as `personas/04-researcher` and `personas/10-general-doctor`.

---

## 5. Relationship to other Medora modules

```text
13-Medora-Family    → consent / permission rules; not a research data source
14-Medora-Connect   → device + vitals data; not a research data source
15-Medora-Classify  → clinical reasoning; relevant for downstream evaluation only
16-Medora-Pathogen  → image / sequence interpretation; relevant for targeted projects
17-Medora-Research  → scientific research workflows
```

Patient or family data must not automatically flow into R&D. Any research use of patient-derived data requires explicit consent, de-identification, governance, and audit logging — the same posture used in `16-Medora-Pathogen/07-safety/SAFETY_AND_COMPLIANCE.md` extended with a clear "research-only" boundary.

The two legitimate cross-module touchpoints:

- **R&D → Classify / Pathogen:** a research project may use Classify or Pathogen artifacts (e.g., calibration curves, model cards, public datasets) as **methodology references** in a publication. The data flow is one-way (publication consumes published artifacts).
- **Classify / Pathogen → R&D:** a research project may study **how these models perform** as a research subject, under explicit governance, with the same R0–R5 risk classification.

In neither direction does patient-level data flow into R&D without governance.

---

## 6. Reversibility

- Disable the feature flag → `/api/research/*` returns 404; the sidebar entry hides; no persona under Medora Research can be loaded.
- Drop the new tables (see `12-sql/medora_research_schema.sql`) → no impact on existing tables.
- Delete the `17-Medora-Research/` documentation folder → other modules are unaffected.

This matches the additive contract used in `14-Medora-Connect/`, `15-Medora-Classify/`, and `16-Medora-Pathogen/`.

---

## 7. Cross-references

- [`../13-Medora-Family/README.md`](../13-Medora-Family/README.md)
- [`../14-Medora-Connect/README.md`](../14-Medora-Connect/README.md)
- [`../15-Medora-Classify/README.md`](../15-Medora-Classify/README.md)
- [`../16-Medora-Pathogen/README.md`](../16-Medora-Pathogen/README.md)
- [`02-personas/RESEARCHER_AND_DOCTOR_ANALYSIS.md`](../02-personas/RESEARCHER_AND_DOCTOR_ANALYSIS.md)
- [`09-safety/RESEARCH_SAFETY_AND_GOVERNANCE.md`](../09-safety/RESEARCH_SAFETY_AND_GOVERNANCE.md)
