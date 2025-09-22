FROM node:18-alpine

WORKDIR /usr/src/app

# 1. Copiar APENAS arquivos necessários para instalação
COPY package*.json ./
COPY prisma ./prisma/

# 2. Instalar TODAS as dependências (incluindo dev para build)
RUN npm ci

# 3. Gerar Prisma Client PRIMEIRO
RUN npx prisma generate

# 4. Copiar o resto do código
COPY . .

# 5. Fazer o build
RUN npm run build

# 6. Limpar dependências de desenvolvimento
RUN npm prune --production

EXPOSE 3000

# 7. Comando de inicialização
CMD sh -c "echo 'Executando migrations...' && npx prisma migrate deploy && echo 'Migrations aplicadas!' && npm run start:prod"
