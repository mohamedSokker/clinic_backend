import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'mhmd.sokkar92@gmail.com';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('User already exists');
    return;
  }

  await prisma.user.create({
    data: {
      uid: 'MOCK_UID_GMAIL_TEST',
      email: email,
      role: 'patient',
      name: 'Mohamed Gmail Test',
      mobile: '123456789',
      patient: {
        create: {}
      }
    }
  });
  console.log('Created test user for:', email);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
