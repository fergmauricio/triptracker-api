# 🚀 TripTracking API - Sistema de Gerenciamento de Viagens

# Tecnologias e Serviços Utilizados:

NestJS
TypeScript
Prisma
PostgreSQL
Redis
Docker
AWS S3
RabbitMQ
Railway
GitHub Actions

> API robusta e escalável para gerenciamento completo de viagens, em desenvolvimento com arquitetura moderna e melhores práticas de mercado.

---

# 🎯 Para Recrutadores & Avaliadores Técnicos

## 🔗 Acesso Rápido:

- **Demo Online**: (https://triptrackingapi-production.up.railway.app)
- **Postman Collection**: [Download aqui](https://github.com/fergmauricio/triptracker-api/releases/download/v1.0.0/TripTracking.API.-.Production.postman_collection.json)
- **Code Review**: Disponível sob agendamento

## 📞 Avaliação Técnica:

_Agende uma demonstração ao vivo onde explico:_

- Arquitetura e tomadas de decisão
- Padrões de código implementados
- Soluções para desafios técnicos
- Planejamento de escalabilidade

---

## ✨ Características Principais

### 🔐 **Sistema de Autenticação Avançado**

- JWT com refresh tokens automáticos
- Hash de senhas com bcrypt
- Proteção de rotas com Guards NestJS
- Sistema de recuperação de senha

### ☁️ **Upload de Assets com AWS S3**

```typescript
// Upload direto para S3 com URLs assinadas
await this.awsS3Service.uploadFile(file, 'avatars');
```

1. Upload direto sem armazenamento local
2. URLs temporárias assinadas para segurança

### ☁️ **Sistema de Filas com RabbitMQ/CloudAMQP**

```typescript
// Processamento assíncrono de emails
await this.rabbitMQService.publish('email_queue', emailData);
```

1. Filas dedicadas para diferentes serviços
2. Retry automático em caso de falhas
3. Escalabilidade horizontal de workers
4. Monitoramento em tempo real

### 💾 **Cache Inteligente com Redis**

```typescript
@CacheKey('user_trips')
@CacheTTL(300) // 5 minutos
async getUserTrips(@Req() req: Request)
```

Obs.: ** Ainda em desenvolvimento **

### 🏗️ Arquitetura do Sistema

Client Frontend → API Gateway (NestJS) → Serviços Especializados
│
├── 📊 PostgreSQL (Dados)
├── ⚡ Redis (Cache)
├── 📨 RabbitMQ (Filas)
└── ☁️ AWS S3 (Arquivos)
