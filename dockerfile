FROM node:18-alpine

WORKDIR /usr/src/app

# 1. Copiar arquivos
COPY . .

# 2. Instalar dependências
RUN npm ci --only=production

# 3. Gerar Prisma Client
RUN npx prisma generate

# 4. Build
RUN npm run build

CMD sh -c "echo 'Executando migrations...' && npx prisma migrate deploy && echo 'Migrations aplicadas!' && npm run start:prod"
