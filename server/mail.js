import nodemailer from 'nodemailer';
import { config } from './config.js';

const { host, port, user, pass } = config.smtp;

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
});

export function enviarCredenciales({ empleado, herramienta, credencial }) {
  return transporter.sendMail({
    from: `"Portal IA" <${user}>`,
    to: empleado.email,
    subject: `Acceso a ${herramienta}`,
    text:
      `Hola ${empleado.name},\n\n` +
      `Has solicitado acceso a ${herramienta} desde el Portal IA.\n\n` +
      `Usuario: ${credencial.usuario}\n` +
      `Contraseña: ${credencial.password}\n\n` +
      `No compartas estas credenciales con nadie.`,
  });
}
