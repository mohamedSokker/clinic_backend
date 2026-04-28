import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLab() {
  const labId = 'b53eaacd-6bd3-41ff-b1ae-ce2413548b6d';
  const lab = await prisma.lab.findUnique({
    where: { id: labId },
    include: { user: true }
  });
  console.log('Lab found:', lab);
  process.exit(0);
}

checkLab().catch(e => {
  console.error(e);
  process.exit(1);
});
