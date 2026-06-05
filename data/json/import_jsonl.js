/**
 * Firestore JSONL Importer
 * Usage:
 *   1) Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON.
 *   2) node import_jsonl.js --project <project-id> --file firestore/seed.jsonl
 */
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const admin = require('firebase-admin');

const argv = yargs
  .option('project', { type: 'string', demandOption: true })
  .option('file', { type: 'string', default: 'firestore/seed.jsonl' })
  .argv;

admin.initializeApp({ projectId: argv.project });
const db = admin.firestore();

(async () => {
  const filePath = path.resolve(argv.file);
  const lines = fs.readFileSync(filePath, 'utf-8').split(/\r?\n/).filter(Boolean);
  let count = 0;
  for (const line of lines) {
    const { path: docPath, doc } = JSON.parse(line);
    const ref = db.doc(docPath);
    await ref.set(doc, { merge: true });
    count++;
  }
  console.log(`Imported ${count} documents into project ${argv.project}`);
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
