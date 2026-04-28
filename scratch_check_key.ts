import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const key = process.env.FIREBASE_PRIVATE_KEY;
console.log('Key length:', key?.length);
console.log('First 50 chars:', key?.substring(0, 50));
console.log('Contains literal \\n:', key?.includes('\\n'));
console.log('Contains actual newline:', key?.includes('\n'));
