import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const labs = await prisma.lab.findMany();

  for (const lab of labs) {
    // If analysisTypes is not an array of objects, reset it
    if (!Array.isArray(lab.analysisTypes) || (lab.analysisTypes.length > 0 && typeof lab.analysisTypes[0] === 'string')) {
      console.log(`Updating lab ${lab.labName}...`);
      await prisma.lab.update({
        where: { id: lab.id },
        data: {
          analysisTypes: [
            { name: 'Full Blood Count', cost: 120 },
            { name: 'Glucose Tolerance', cost: 85 },
            { name: 'MRI Scan', cost: 450 }
          ],
          workingHours: lab.workingHours || {
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
    }
  }
  console.log('All labs updated successfully');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
