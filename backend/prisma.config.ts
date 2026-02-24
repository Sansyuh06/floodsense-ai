import "dotenv/config";
import path from "path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || `file:${path.resolve(__dirname, "prisma", "floodsense.db")}`,
  },
});
