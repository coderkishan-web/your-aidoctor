# Analysis — Adding Medora Family after 12-MetaEngine-Nearby

## Current repository situation

The repository already has:

- `9-HuggingFace-Global`: Medora web/PWA client with chat, health dashboard, medicines, appointments, vitals, records, profile, auth, and sync hooks.
- `11-Medicine-Scanner`: medicine label scanner service.
- `12-MetaEngine-Nearby`: nearby doctor/pharmacy metaengine.

The right place for the new family product is therefore:

```text
13-Medora-Family
```

## Recommended interpretation of the new feature

The family product should not replace Medora. It should become a layer above individual Medora clients:

```text
Individual Medora client  --->  Medora Family family space
Family Admin client     --->  Family Admin
Adult member client     --->  Adult Mode member
Child 1 Medora/Profile   --->  Child/guardian-managed member
Child 2 Medora/Profile   --->  Child/guardian-managed member
```

## Why modes are needed

The current Medora app has many features. For family usage, this should be simplified by mode:

- `standard`: simple standalone Medora.
- `adult`: full personal Medora, with consent controls for family sharing.
- `child`: simplified guardian-managed health timeline.
- `family-admin`: family dashboard, tree, invites, monthly check-ins, exports.

## Implementation done in this package

### New module

Added:

```text
13-Medora-Family/
```

With product, contract, domain, integration, and privacy documentation.

### Medora integration

Added to `9-HuggingFace-Global`:

```text
lib/family-health.ts
lib/hooks/useFamilyHealth.ts
components/views/FamilyHealthView.tsx
```

Patched:

```text
components/MedoraApp.tsx
components/chat/Sidebar.tsx
README.md
```

## Prototype behavior

The prototype adds a new **Medora Family** sidebar item. It supports:

- mode selection
- default family creation: Family Admin, Adult member, Child 1, Child 2
- family tree member cards
- Adult Mode / Child Mode / Family Admin labels
- consent status switching
- monthly health check-in per member
- invite-code generation for linking a member's own Medora client
- JSON export of family data

## Backend recommendation

Keep the current local-first version for MVP validation. Next step is adding authenticated API routes based on `13-Medora-Family/02-contracts/family_contracts.md`.

## Safety recommendation

Medora Family should only track, remind, summarize, and export. It should not diagnose, change medication, or replace medical care.
