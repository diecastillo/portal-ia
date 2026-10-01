import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { empleados, credenciales, directorioPublico, listarSolicitudes, registrarSolicitud } from './store.js';
import { enviarCredenciales } from './mail.js';

const app = express();
app.disable('x-powered-by');
if (config.portalOrigin) app.use(cors({ origin: config.portalOrigin }));
app.use(express.json({ limit: '10kb' }));

// Máx. 5 solicitudes por minuto y por IP: evita que alguien sature el correo de otra persona.
const limitarSolicitudes = rateLimit({ windowMs: 60_000, limit: 5, standardHeaders: true, legacyHeaders: false });

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/directorio', (req, res) => res.json(directorioPublico()));

app.post('/api/solicitar-password', limitarSolicitudes, async (req, res) => {
  const { empleadoId, herramienta } = req.body || {};
  const empleado = empleados[empleadoId];
  const credencial = credenciales[herramienta];

  if (!empleado) return res.status(400).json({ error: 'Empleado no reconocido' });
  if (!credencial) return res.status(400).json({ error: 'Herramienta no reconocida' });

  try {
    await enviarCredenciales({ empleado, herramienta, credencial });
    registrarSolicitud({
      empleado: empleado.name,
      dept: empleado.dept,
      herramienta,
      fecha: new Date().toISOString(),
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('Error al enviar el correo:', err);
    res.status(500).json({ error: 'No se pudo enviar el correo' });
  }
});

// Para el panel de estadísticas del portal
app.get('/api/solicitudes', (req, res) => res.json(listarSolicitudes()));

// El frontend se sirve desde el mismo proceso (o nginx puede servir /public directamente)
app.use(express.static(config.publicDir));

app.listen(config.port, () => console.log(`Portal IA escuchando en :${config.port}`));
