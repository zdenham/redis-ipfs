import { RipDBClient } from '@rip-db/client';
const ripServerUrl = 'https://rip-sandbox.onrender.com';

export const rip = new RipDBClient({ ripServerUrl, enableEncryption: true });
