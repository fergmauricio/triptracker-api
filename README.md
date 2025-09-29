# 🚀 TripTracking API - Sistema de Gerenciamento de Viagens

## Índice

- [Arquitetura e Padrões](#arquitetura-e-padrões)
- [Tecnologias](#tecnologias)
- [Para Recrutadores](#para-recrutadores)
- [Documentação da API](#documentacao)
- [Instalação](#instalação)
- [Segurança](#seguranca)
- [Contribuição](#contribuição)

<a id="arquitetura-e-padrões"></a>

## Arquitetura e Padrões

### ✅ Clean Architecture Implementada

```typescript
src/
├── domain/                          # Camada de Domínio (Core Business)
│   ├── entities/                    # Entidades de Domínio ricas em comportamento
│   ├── value-objects/               # Objetos de valor com validações de negócio
│   ├── domain-events/               # Eventos de domínio para comunicação assíncrona
│   ├── ports/                       # Interfaces para inversão de dependência
│   ├── repository-interfaces/       # Contratos de repositórios (persistência)
│   └── factories/                   # Fábricas para criação complexa de objetos
│
├── application/                     # Camada de Aplicação (Use Cases)
│   ├── use-cases/                   # Casos de uso que orquestram o domínio
│   ├── commands/                    # Padrão Command para operações
│   └── providers/                   # Configuração de injeção de dependência
│
├── infrastructure/                  # Camada de Infraestrutura (Details)
│   ├── adapters/                    # Implementações concretas das ports
│   │   ├── auth/                    # Autenticação JWT
│   │   ├── persistence/             # Acesso a dados (Prisma)
│   │   ├── messaging/               # Sistema de mensageria (RabbitMQ)
│   │   └── external/                # Serviços externos (AWS, Email)
│   ├── config/                      # Configurações da aplicação
│   ├── validators/                  # Validações específicas
│   └── messaging/                   # Módulo de mensageria
│
└── presentation/                    # Camada de Apresentação (Delivery)
    ├── controllers/                 # Controladores REST
    ├── dtos/                        # Data Transfer Objects
    ├── filters/                     # Filtros de exceção
    └── modules/                     # Módulos da camada
```

<a id="tecnologias"></a>

## 🛠️ Tecnologias

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

<a id="para-recrutadores"></a>

## 🎯 Para Recrutadores Técnicos

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

<a id="documentacao"></a>

## 📚 Documentação da API

A API está totalmente documentada com Swagger/OpenAPI 3.0.

**🔗 Acesse a Documentação Interativa:**

```typescript
https://triptrackingapi-production.up.railway.app/api/docs
```

<a id="instalação"></a>

## 🚀 Instalação e Configuração

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

# Inicie os containers do Docker
docker-compose up -d

# Inicie a aplicação
npm run start:dev
```

<a id="seguranca"></a>

## 🔒 Segurança

A API possui rate limiting básico para prevenir abuse:

- **100 requests** por IP a cada **15 minutos**
- Headers informativos incluídos nas respostas
- Status `429 Too Many Requests` quando excedido

<a id="contribuição"></a>

## 🤝 Contribuição

Este projeto foi criado para demonstração de habilidades técnicas, mas contribuições são bem-vindas.
Entre em contato no e-mail: mauricioferg@gmail.com

## ✅ Licença

MIT License - veja o arquivo LICENSE para detalhes.
