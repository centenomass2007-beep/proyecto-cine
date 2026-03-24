import fs from "node:fs";
import path from "node:path";

import { defineConfig } from "prisma/config";

const envPath = path.join(process.cwd(), ".env");

if (fs.existsSync(envPath)) {
  const envEntries = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of envEntries) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();
    const normalizedValue = rawValue.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");

    if (!process.env[key]) {
      process.env[key] = normalizedValue;
    }
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
