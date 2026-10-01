# Portal IA

Portal interno con las herramientas de IA de la empresa. Un único proceso Node
sirve el frontend y la API. Cuando alguien pide la contraseña de una
herramienta, el backend la busca y se la envía por email a la dirección real
de esa persona; la contraseña nunca llega al navegador.

## Estructura

```
portal-ia/
├── server/                  Backend (Express)
│   ├── index.js             Rutas y arranque
│   ├── config.js            Variables de entorno y rutas
│   ├── store.js             Lectura de datos y registro de solicitudes
│   └── mail.js              Envío de correos (SMTP)
├── public/                  Frontend estático
│   ├── index.html
│   ├── css/styles.css
│   ├── js/                  main, tools, identity, stats, theme, api, util, logos
│   └── data/herramientas.json   Catálogo de herramientas (editable)
├── data/
│   ├── empleados.json           Empleados, emails y departamentos
│   ├── credenciales.example.json  Plantilla de credenciales
│   ├── credenciales.json        Credenciales reales (NO se sube a git)
│   └── solicitudes.json         Se genera solo: registro de solicitudes
├── .env.example
└── package.json
```

## Configuración

1. `data/empleados.json`: pon los empleados reales (nombre, email, departamento).
   El selector del portal se genera de aquí, no hay que tocar el HTML.
2. `data/credenciales.json`: pon el usuario y contraseña reales de cada herramienta
   (la plantilla es `credenciales.example.json`).
3. `public/data/herramientas.json`: catálogo. `requiresCredential: true` muestra el
   botón de enviar contraseña y exige una entrada con el mismo nombre en `credenciales.json`.
4. `.env`: copia `.env.example` y rellena el SMTP **en el servidor**.

## Arrancar

```bash
npm install
npm start          # o: npm run dev  (recarga automática)
```

En producción con pm2:

```bash
pm2 start server/index.js --name portal-ia
pm2 save
```

## nginx

Basta con un proxy a todo el sitio:

```nginx
location / {
    proxy_pass http://localhost:4001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

Si nginx está detrás de otro proxy, activa `app.set('trust proxy', 1)` en `server/index.js`
para que el límite de peticiones use la IP real.

## Seguridad

- Máximo 5 solicitudes por minuto y por IP.
- `/api/solicitudes` (estadísticas) es público dentro del portal: protege el
  acceso al portal (VPN, basic auth en nginx o SSO), porque quien quiera
  puede pedir la contraseña de cualquier empleado (le llega a *su* email, no al tuyo).
- Las contraseñas están en texto plano en `data/credenciales.json`; mantén ese
  archivo fuera de git y con permisos restringidos (`chmod 600`).
