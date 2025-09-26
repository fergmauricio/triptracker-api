# README.md (Português BR)

# 🚀 TripTracking API - Sistema de Gerenciamento de Viagens

## Índice

- [Arquitetura e Padrões](#arquitetura-e-padrões)
- [Tecnologias](#🛠️-tecnologias)
- [Para Recrutadores](#🎯-para-recrutadores)
- [Instalação](#🚀-instalação)
- [Contribuição](#🤝-contribuição)

## Arquitetura e Padrões

### ✅ Clean Architecture Implementada

```typescript
src/
├── domain/ # Regras de Negócio & Padrões Enterprise
│ ├── entities/ # Modelos de Domínio Ricos com Comportamento
│ ├── value-objects/ # Validação & Restrições de Negócio
│ ├── domain-events/ # Definições de Eventos de Domínio
│ └── ports/ # Interfaces (Inversão de Dependência)
│
├── application/ # Casos de Uso & Lógica de Aplicação
│ ├── use-cases/ # Orquestração de Regras de Negócio
│ └── commands/ # Implementação do Padrão Command
│
├── infrastructure/ # Frameworks & Serviços Externos
│ ├── adapters/ # Implementações Concretas das Ports
│ └── persistence/ # Configurações de Database & ORM
│
└── presentation/ # Mecanismos de Entrega (HTTP API)
├── controllers/ # Endpoints REST
└── dtos/ # Objetos de Transferência de Dados
```

### ✅ Padrões Domain-Driven Design

- **Modelos de Domínio Ricos**: Entidades com lógica de negócio encapsulada.
- **Value Objects**: Email, UserId, PasswordHash com validação e outros.
- **Domain Events**: UserRegisteredEvent, PasswordResetRequestedEvent e outros.
- **Repository Pattern**: Acesso a dados abstraído com implementação Prisma.

### ✅ Arquitetura Orientada a Eventos

```typescript
// Processamento Assíncrono com RabbitMQ
Cadastro de Usuário → UserRegisteredEvent → Serviço de Email → Email de Boas-Vindas.
Reset de Senha → PasswordResetRequestedEvent → Serviço de Email → Link de Reset.
```

### ✅ Padrões Enterprise Implementados

- **Ports & Adapters**: Inversão de dependência com limites claros.
- **Factory Pattern**: Criação de PasswordResetToken.
- **Strategy Pattern**: Múltiplos provedores de email (SendGrid/Resend).
- **Observer Pattern**: Handlers de eventos de domínio.

### ✅ Stack Tecnológica

**Framework Core**

- NestJS - Framework Node.js para enterprise.
- TypeScript - Type safety e melhor experiência do desenvolvedor.

**Camada de Dados**

- PostgreSQL - Database principal com Prisma ORM.
- Prisma - Cliente de database type-safe com migrations.

**Mensageria & Processamento Assíncrono**

- RabbitMQ - Message broker para arquitetura orientada a eventos.
- Domain Events - Processamento assíncrono com entrega garantida.

**Serviços Cloud**

- AWS S3 - Armazenamento de arquivos com URLs assinadas.
- Múltiplos Provedores de Email - SendGrid & Resend com fallback.

**Infraestrutura**

- Docker - Containerização.
- Railway - Plataforma de deployment.
- GitHub Actions - Pipeline de CI/CD.

### ✅ Para Recrutadores Técnicos

**Decisões Arquiteturais Demonstradas:**

- Clean Architecture para maintainability e testabilidade.
- Domain-Driven Design para modelagem de lógica de negócio complexa.
- Event-Driven Architecture para escalabilidade e resiliência.
- Dependency Injection com separação adequada de concerns.

**Destaques de Qualidade de Código:**

- Type Safety em toda a codebase.
- Error Handling adequado com exceções específicas do domínio.
- Validation em múltiplas camadas (DTO, Domain, Database).
- Logging e padrões de observabilidade.

### ✅ Instalação e Configuração

```
# Clone o repositório
git clone git@github.com:fergmauricio/triptracker-api.git
cd triptracker-api

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Execute as migrations do banco
npx prisma migrate dev

# Inicie os container do Docker
docker-compose up -d

# Inicie a aplicação
npm run start:dev
```

### ✅ Contribuição

Este projeto foi criado para demonstração de habilidades técnicas, mas contribuições são bem-vindas.
Entre em contato no e-mail: mauricioferg@gmail.com

### ✅ Licença

MIT License - veja o arquivo LICENSE para detalhes.
