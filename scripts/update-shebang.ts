#!/usr/bin/env ts-node

import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const ROOT = dirname(__dirname);
const tsShebang = "#!/usr/bin/env ts-node";
const jsShebang = "#!/usr/bin/env node";

async function updateShebang (path: string) {
  const originalContent = await readFile(path, { encoding: "utf8" });
  const updatedContent = originalContent.replace(tsShebang, jsShebang);
  await writeFile(path, updatedContent, { encoding: "utf8" });
}

async function main () {
  const npmResult = spawnSync("npm", ["show", ".", "bin", "--json"], {
    cwd: ROOT,
    shell: true,
    encoding: "utf8",
  });

  if (npmResult.stdout) {
    const binEntries = JSON.parse(npmResult.stdout) as Record<string, string>;
    const binPaths = Object.values(binEntries);

    for (const binPath of binPaths) {
      await updateShebang(resolve(ROOT, binPath));
    }
  }
}

main().catch((err: Error) => {
  process.exitCode = 1;
  console.error(err.stack);
});
