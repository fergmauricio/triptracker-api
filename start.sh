#!/bin/sh
set -e  # Para em qualquer erro

echo "Iniciando TripTracking API..."

echo "Gerando Prisma client..."
npx prisma generate

if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL requerida!"
    exit 1
fi

echo "Executando migrations..."
npx prisma migrate deploy

echo "Testando conexão com o banco..."
npx prisma db execute --stdin << EOF
SELECT 1 AS connection_test;
EOF

echo "Banco de Dados pronto!"
echo "Inicializando NestJS application..."
exec npm run start:prod
