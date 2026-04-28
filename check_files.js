const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const analysisFiles = await prisma.analysisFile.findMany();
  console.log('Analysis Files:', JSON.stringify(analysisFiles, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
