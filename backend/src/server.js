import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const envPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '.env'
);

dotenv.config({ path: envPath });

const { default: app } = await import('./app.js');

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
