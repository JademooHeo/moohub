import * as dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// .env.local 우선 로드 (Next.js 환경)
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
  },
});
