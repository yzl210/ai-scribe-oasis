import PgBoss from 'pg-boss';
import {registerTranscribeJob} from './transcribe';
import {registerGenerateJob} from './generate';

const boss = new PgBoss(process.env.DATABASE_URL!);

async function main() {
    await boss.start();
    await registerTranscribeJob();
    await registerGenerateJob();
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });


export default boss;
