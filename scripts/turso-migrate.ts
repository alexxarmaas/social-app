import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const url = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !url.startsWith("libsql://")) {
    console.error("Error: DATABASE_URL must be a libsql:// URL for this script.");
    process.exit(1);
}

if (!authToken) {
    console.error("Error: TURSO_AUTH_TOKEN is missing.");
    process.exit(1);
}

const client = createClient({
    url,
    authToken,
});

async function main() {
    console.log("🚀 Starting migration to Turso...");

    const migrationsDir = path.join("../", "prisma", "migrations");

    if (!fs.existsSync(migrationsDir)) {
        console.error("Error: prisma/migrations directory not found.");
        process.exit(1);
    }

    // Get all migration folders, sorted by name (timestamp)
    const migrationFolders = fs
        .readdirSync(migrationsDir)
        .filter((f) => fs.statSync(path.join(migrationsDir, f)).isDirectory())
        .sort();

    console.log(`Found ${migrationFolders.length} migrations.`);

    for (const folder of migrationFolders) {
        const migrationFile = path.join(migrationsDir, folder, "migration.sql");

        if (fs.existsSync(migrationFile)) {
            console.log(`Applying migration: ${folder}`);
            const sql = fs.readFileSync(migrationFile, "utf-8");

            // Split SQL by semicolons to execute statements individually if needed, 
            // but LibSQL executeMultiple might be better if available, or just execute the whole block.
            // For SQLite, usually executing the whole script works if the driver supports it.
            // @libsql/client's execute() handles single statements. executeMultiple() handles scripts.

            try {
                await client.executeMultiple(sql);
                console.log(`✅ Applied: ${folder}`);
            } catch (e: any) {
                console.error(`❌ Failed to apply ${folder}:`, e.message);
                // We don't exit here because some errors might be "table exists" if we are re-running.
                // In a real production script, we would track applied migrations in a table.
                // For this fix, we assume the user is setting up a fresh DB or knows what they are doing.
            }
        }
    }

    console.log("🏁 Migration process finished.");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
