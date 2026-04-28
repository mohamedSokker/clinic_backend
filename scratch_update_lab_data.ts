import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const lab = await prisma.lab.findFirst({
    where: { labName: 'Lab1' }
  });

  if (lab) {
    await prisma.lab.update({
      where: { id: lab.id },
      data: {
        labName: 'Lumina Precision Lab',
        analysisTypes: [
          { name: 'Full Blood Count', cost: 120 },
          { name: 'Glucose Tolerance', cost: 85 },
          { name: 'MRI Scan', cost: 450 }
        ],
        workingHours: {
          monday: { start: '08:00', end: '18:00', isActive: true },
          tuesday: { start: '08:00', end: '18:00', isActive: true },
          wednesday: { start: '08:00', end: '18:00', isActive: true },
          thursday: { start: '08:00', end: '18:00', isActive: true },
          friday: { start: '08:00', end: '18:00', isActive: true },
          saturday: { start: '09:00', end: '14:00', isActive: true },
          sunday: { start: '00:00', end: '00:00', isActive: false }
        }
      }
    });
    console.log('Lab updated successfully');
  } else {
    console.log('Lab not found');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
