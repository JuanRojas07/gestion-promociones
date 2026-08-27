# Decisiones del proyecto

Elegi un stack simple porque la prueba pide una app pequeña, no un sistema enorme.

## Frontend: React + Vite
La prueba lo pide si o si. Vite me parecio mas facil de levantar que Create React App (que ya esta medio viejo). Deje todo en una sola pantalla: resumen, formulario y tabla. No meti rutas ni librerias extra para no complicarlo.

## Backend: Node.js con Express
Pude elegir Node o Laravel. Me fui por Node porque ya iba a usar JavaScript en el front y asi no mezclo PHP. Express es lo que sale en casi todos los tutoriales para armar una API rapido.

Las validaciones estan en un archivo aparte (`validaciones.js`) para poder testearlas sin tener que levantar el servidor.

## Base de datos: PostgreSQL
Entre Postgres, SQL Server y Mongo me quede con Postgres. Es gratis, se consigue facil en Docker y para este caso unas tablas normales alcanzan.

Hay 2 tablas:
- `productos`: ahi deje productos y categorias (un campo `tipo`) para asociar la promocion.
- `promociones`: los descuentos, fechas y el estado.

No hice un modulo de inventario porque no lo pedian. Solo unos registros de ejemplo para poder probar el formulario.

## Estados y vigencia
El estado se cambia a mano: Programada -> Activa -> Finalizada. No se puede saltar ni ir para atras.

La fecha tambien importa:
- Si la promocion empieza despues de hoy, nace como Programada.
- Si hoy ya esta dentro del rango, nace como Activa.
- "Vigentes hoy" del resumen es aparte: cuenta las que tienen la fecha de hoy entre inicio y fin, aunque el estado sea otro. Lo hice asi porque el enunciado habla de fechas, no del estado.

Una finalizada no se edita. Eliminar solo si esta Programada.

## Docker
Piden que se levante con `docker-compose up`. Hay 3 servicios: postgres, backend y frontend. El frontend se construye y se sirve con nginx. Desde el navegador el front llama al backend en `localhost` porque el usuario abre la app en su maquina, no dentro de la red de Docker.

`/health` hace un `SELECT 1` a la base. Si postgres no responde, no da 200.

## CI
El workflow tiene 4 etapas en orden: lint, test, build y smoke test. El smoke test levanta compose y pega a `/health`.

Las contraseñas no van en el repo. Se usan GitHub Secrets. Si falta alguna, el pipeline se cae a proposito.

## Cosas que no hice
Login, roles, aplicar el descuento en un POS, etc. La nota del enunciado dice que no tiene que ser una app grande.
