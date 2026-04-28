"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const lab = await prisma.lab.findFirst({
        include: {
            user: true,
        }
    });
    console.log(JSON.stringify(lab, null, 2));
}
main()
    .catch(e => console.error(e))
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=scratch_fetch_lab.js.map