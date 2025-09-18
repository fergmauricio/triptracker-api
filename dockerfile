FROM node:18-alpine

WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante do código
COPY . .

# Gerar Prisma client
RUN npx prisma generate

# Build da aplicação
RUN npm run build

# Expor a porta
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "run", "start:prod"]