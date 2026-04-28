const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const patients = await prisma.patient.findMany({
    include: { user: true }
  });
  console.log('Patients:', JSON.stringify(patients, null, 2));
  
  const reservations = await prisma.reservation.findMany({
    where: { labId: { not: null } },
    include: { patient: true }
  });
  console.log('Lab Reservations:', JSON.stringify(reservations, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
