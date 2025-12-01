const fs = require('fs');
const path = require('path');

const mode = process.argv[2]; // 'local' or 'prod'

const prismaDir = path.join(__dirname, '..', 'prisma');
const schemaPath = path.join(prismaDir, 'schema.prisma');

let sourceFile;

if (mode === 'local') {
    sourceFile = 'schema.sqlite.prisma';
    console.log('🔄 Switching to SQLite (Local)...');
} else if (mode === 'prod') {
    sourceFile = 'schema.postgres.prisma';
    console.log('🔄 Switching to PostgreSQL (Production)...');
} else {
    console.error('❌ Invalid mode. Use "local" or "prod".');
    process.exit(1);
}

const sourcePath = path.join(prismaDir, sourceFile);

try {
    const content = fs.readFileSync(sourcePath, 'utf8');
    fs.writeFileSync(schemaPath, content);
    console.log(`✅ Successfully switched to ${sourceFile}`);
} catch (error) {
    console.error('❌ Error switching schema:', error);
    process.exit(1);
}
