# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

docker compose down
docker compose up --build  -d

docker compose exec app sh
python3 manage.py runserver 0:8000
python3 manage.py migrate
python3 manage.py createsuperuser


docker compose exec front sh
npm run dev
yarn build
npm run preview

ps aux
kill -9 

создай .env
POSTGRES_USER=user
POSTGRES_DB=db
POSTGRES_PASSWORD=pgpwd4
PGDATA=/var/lib/postgresql/data/pgdata
PGADMIN_DEFAULT_EMAIL=ru@mail.ru
PGADMIN_DEFAULT_PASSWORD=admin
PGADMIN_CONFIG_SERVER_MODE=False


- /Applications/Docker.app/fastapi_db3/data
anywork-app/app/.env

ip docker docker inspect anywork-app-front-1

http://127.0.0.1:8081/