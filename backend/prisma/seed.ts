import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.patient.createMany({
        data: [
            {firstName: 'John', lastName: 'Doe', dob: new Date('1947-02-11'), mrn: 'P0001'},
            {firstName: 'Rose', lastName: 'Nguyen', dob: new Date('1952-07-28'), mrn: 'P0002'},
            {firstName: 'Miguel', lastName: 'Rodriguez', dob: new Date('1939-11-05'), mrn: 'P0003'}
        ]
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
