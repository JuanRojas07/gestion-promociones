# Gestion de promociones

App web sencilla para registrar promociones, ver su estado y controlar la vigencia.

## Que incluye
- Crear / listar / editar promociones
- Cambiar estado: Programada -> Activa -> Finalizada
- Eliminar solo si esta Programada
- Resumen por estado y cuantas estan vigentes hoy
- Endpoint `/health` (200 si la API y la base estan bien)

## Requisitos
- Docker Desktop (con el motor de Docker corriendo)
- Git
- Node.js (solo si vas a correr lint/test afuera de Docker)

La primera vez en Windows hay que abrir **Docker Desktop** y esperar a que diga que esta listo.

En esta maquina Docker se instalo bien, pero el motor no arranca si falta **WSL2**. Si te sale un error de WSL, abre PowerShell **como administrador** y corre:

```powershell
wsl --install
```

Luego reinicia Windows, abre Docker Desktop otra vez y espera a que el icono de la ballena deje de animarse. Sin eso, `docker compose up` se queda colgado.

Si WSL dice que **la virtualizacion no esta habilitada**, hay que entrar a la BIOS/UEFI del PC y activar Intel VT-x o AMD-V (a veces se llama SVM). En Windows tambien: Panel de control > Programas > Activar caracteristicas de Windows > "Plataforma de maquina virtual". Sin eso Docker no arranca.

## Como levantarlo

1. Copia las variables de entorno:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
copy .env.example .env
```

2. Abre el `.env` y llena los valores. Ejemplo de como puede quedar (usa los tuyos, no los subas al repo):

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=pon_una_clave
POSTGRES_DB=promociones
BACKEND_PORT=3001
FRONTEND_PORT=8080
```

3. Sube los contenedores:

```bash
docker compose up --build
```

4. Entra a:
- Front: http://localhost:8080
- API health: http://localhost:3001/health

Para bajarlo:

```bash
docker compose down
```

Si cambias el script de la base (`backend/db/init.sql`) y postgres ya tenia datos, borra el volumen:

```bash
docker compose down -v
```

## Desarrollo local (sin Docker para el front/back)

Primero deja postgres corriendo (con compose o local). En el backend crea un `.env` o exporta:

```
DATABASE_URL=postgres://usuario:clave@localhost:5432/promociones
PORT=3001
```

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

El front de Vite queda en http://localhost:5173

## Tests y linter

```bash
cd backend
npm test
npm run lint

cd ../frontend
npm test
npm run lint
```
