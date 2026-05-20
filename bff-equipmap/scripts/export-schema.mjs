import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

/* global console */

const source = resolve("schema.graphql");
const target = resolve("dist/schema.graphql");

copyFileSync(source, target);
console.log(`Schema exported to ${target}`);
