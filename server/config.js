import 'dotenv/config';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  root,
  publicDir: path.join(root, 'public'),
  dataDir: path.join(root, 'data'),
  port: Number(process.env.PORT) || 4001,
  // Si el portal se sirve desde el mismo dominio, no hace falta CORS.
  portalOrigin: process.env.PORTAL_ORIGIN || '',
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_APP_PASSWORD,
  },
};
