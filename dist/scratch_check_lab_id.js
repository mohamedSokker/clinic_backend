"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
//# sourceMappingURL=scratch_check_lab_id.js.map