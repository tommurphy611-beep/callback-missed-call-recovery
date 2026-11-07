import 'dotenv/config'; import {PrismaClient} from '@prisma/client';
const required=['DATABASE_URL','SESSION_SECRET']; const missing=required.filter(x=>!process.env[x]);
console.log('CallBack preflight');
console.log(`APP_URL: ${process.env.APP_URL||'NOT SET (local-only)'}`);
console.log(`Twilio credentials: ${process.env.TWILIO_ACCOUNT_SID&&process.env.TWILIO_AUTH_TOKEN?'configured':'NOT SET (live calls/SMS unavailable)'}`);
if(missing.length){console.error(`Missing: ${missing.join(', ')}`);process.exit(1)}
const db=new PrismaClient(); try{await db.$queryRaw`SELECT 1`;console.log('Database: reachable');}catch{console.error('Database: unreachable — check DATABASE_URL and migrations');process.exitCode=1}finally{await db.$disconnect()}
