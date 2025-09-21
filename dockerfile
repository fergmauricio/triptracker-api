FROM node:18-alpine

WORKDIR /usr/src/app

# 1. Copiar APENAS arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# 2. Instalar dependências de PRODUÇÃO
RUN npm ci --only=production

# 4. Copiar o restante do código
COPY . .

# 5. Build da aplicação
RUN npm run build

# 6. Expor a porta
EXPOSE 3000

# 7. Comando para rodar a aplicação (gera Prisma NO RUNTIME)
CMD npx prisma generate && npm run start:prod
