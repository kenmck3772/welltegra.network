# Firestore Seed — WellTegra (7 wells)

This bundle seeds documents under the path:
`artifacts/welltegra/wells/<wellId>` with an `events` subcollection.

## Quick start
1. Create a Firebase project and a service account JSON with Firestore Admin role.
2. Download the key and set the env var:
   `export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json`
3. Install deps:
   `cd firestore && npm i`
4. Import:
   `node import_jsonl.js --project <your-project-id> --file firestore/seed.jsonl`

## Notes
- Placeholder docs named `_placeholder` are included so subcollections exist; delete them once real docs are added.
- The default app namespace is `welltegra`; change it by editing `seed.jsonl`.
- All seven wells: w-11, w-22, w-33, w-44, w-55, w-666, w-77
