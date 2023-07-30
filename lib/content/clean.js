#!/usr/bin/env ts-node
"use strict";
// This file is managed by code-skeleton. Do not make changes.
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const child_process_1 = require("child_process");
const ROOT = (0, node_path_1.dirname)(__dirname);
const lsFilesResult = (0, child_process_1.spawnSync)("git", ["ls-files", "--other", "--ignored", "--exclude-standard", "--directory"], {
    cwd: ROOT,
    shell: true,
    encoding: "utf8",
});
const toRemove = lsFilesResult.stdout.split("\n")
    .filter(Boolean)
    .filter((file) => file !== "node_modules/");
for (const file of toRemove) {
    (0, node_fs_1.rmSync)((0, node_path_1.join)(ROOT, file), { recursive: true });
}
