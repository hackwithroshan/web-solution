import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In dev (tsx), __dirname is '.../backend'.
// In prod (node dist/index.js), __dirname is '.../backend/dist'.
// The .env file is always in '.../backend'.
const envPath = path.resolve(__dirname.endsWith('dist') ? path.join(__dirname, '../.env') : path.join(__dirname, '.env'));

dotenv.config({ path: envPath });
