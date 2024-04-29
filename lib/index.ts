import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { readFile, rm } from "node:fs/promises";
import { copy, json, pkg, type Skeleton } from "code-skeleton";
import { mustache } from "./mustache";

const ownPkg = JSON.parse(
  readFileSync(join(dirname(__dirname), "package.json"), { encoding: "utf8" })
) as { name: string; version: string };

interface Variables {
  dogfood?: boolean;
  library?: boolean;
  ci?: object;
}

type PkgContents = {
  // we don't use these fields directly, we just need to know if they have a value
  bin?: unknown;
  directories?: { bin?: unknown };

  // these ones we inspect
  name: string;
  devDependencies?: Record<string, string>;
};

export default async function (root: string, variables: Variables) {
  const actualContent = await readFile(join(root, "package.json"), { encoding: "utf8" });
  const actualPkg = JSON.parse(actualContent) as PkgContents;
  if (actualPkg.name !== ownPkg.name && actualPkg.devDependencies?.[ownPkg.name] !== ownPkg.version) {
    console.log(`ERROR! The devDependency "${ownPkg.name}" must be set to the exact version "${ownPkg.version}"`);
    console.log(`Try running \`npm install --save-exact -D ${ownPkg.name}\``);
    process.exit(1);
  }

  const hasBin = !!(actualPkg.bin || actualPkg.directories?.bin);

  const csBin = variables.dogfood ? "./bin/code-skeleton.ts" : "code-skeleton";
  const skeleton: Skeleton = {
    "package.json": pkg({
      "//": "This file is partially managed by code-skeleton. Changes may be overwritten.",
      main: "lib/index.js",
      files: {
        append: [
          "bin/**/*.js",
          "lib/**/*.js",
          "lib/**/*.d.ts",
          "!lib/types/**",
        ],
      },
      scripts: {
        clean: "./scripts/clean.ts",
        prelint: "tsc --noEmit",
        lint: "eslint .",
        postlint: "npm run skeleton:verify",
        test: "tap",
        posttest: "npm run lint",
        "skeleton:apply": `${csBin} apply`,
        "skeleton:verify": `${csBin} verify`,
        ...(hasBin
          ? {
            "update-shebang": "./scripts/update-shebang.ts",
            prepack: "tsc --project tsconfig.build.json && npm run update-shebang",
          }
          : {
            prepack: "tsc --project tsconfig.build.json",
          }
        ),
        postinstall: "tap build",
      },
      types: "lib/index.d.ts",
      devDependencies: {
        "@tsconfig/node20": "^20.0.0",
        "@types/node": "^20.0.0",
        "@typescript-eslint/eslint-plugin": "^6.0.0",
        "@typescript-eslint/parser": "^6.0.0",
        "eslint": "^8.0.0",
        "tap": "^18.7.0",
        "tsx": "4.2.1",
        "typescript": "^5.0.0"
      },
      "overrides": {
        // Needed with the 4.2.1 tsx version lock to fix code coverage
        // https://github.com/privatenumber/tsx/issues/433
        "@tapjs/tsx": {
          "tsx": "$tsx"
        }
      },
      removeDependencies: [
        "@types/tap",
        "@tsconfig/node18"
      ]
    }),
    "tsconfig.json": json({
      set: {
        "//": "This file is partially managed by code-skeleton. Changes may be overwritten.",
        extends: "@tsconfig/node20/tsconfig.json",
      },
      append: {
        include: [
          "**/*.ts",
          ".eslintrc.js",
        ],
        "compilerOptions.typeRoots": [
          "./node_modules/@types",
          "./lib/types",
        ],
      },
    }),
    "tsconfig.build.json": json({
      set: {
        "//": "This file is partially managed by code-skeleton. Changes may be overwritten.",
        extends: "./tsconfig.json",
        "compilerOptions.declaration": true,
      },
      append: {
        exclude: [
          "./scripts/**",
          "./test/**",
        ],
      },
    }),
    ".eslintrc.js": copy(join(__dirname, "content", "eslintrc.js")),
    ".gitignore": copy(join(__dirname, "content", "gitignore")),
    "scripts/clean.ts": copy(join(__dirname, "content", "clean.ts")),
    ".github/workflows/ci.yml": mustache({
      path: join(__dirname, "content", "ci.yml"),
      variables: variables.ci || {},
    }),
    ".github/matchers/tap.json": copy(join(__dirname, "content", "tap.json")),
  };

  if (variables.library) {
    await rm(join(root, "package-lock.json"), { force: true });
    skeleton[".npmrc"] = copy(join(__dirname, "content", "npmrc"));
  }

  if (hasBin) {
    skeleton["scripts/update-shebang.ts"] = copy(join(__dirname, "content", "update-shebang.ts"));
  }

  return skeleton;
}
