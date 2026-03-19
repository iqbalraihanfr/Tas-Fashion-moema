import { cleanupAllQaData } from "../tests/e2e/helpers/qa-cleanup";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const summary = await cleanupAllQaData(dryRun);

  console.log(dryRun ? "QA cleanup dry run summary:" : "QA cleanup summary:");
  console.table(summary);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
