---
applyTo: '**'
description: 'Project architecture and coding standards for PSM Chimera v2 backend.'
---

# PSM Chimera v2 - Copilot Instructions

## 🎯 Project Overview

**PSM Chimera v2** is a modern automation platform that synchronizes discounts between ERP systems (RP), offer platforms (CresceVendas), and notification channels (Telegram). This is a migration from a legacy `server-node-fill` system to a configurable, scalable architecture.

### Core Business Flow
1. **Sync Products**: Pull products with discounts from RP (ERP)
2. **Process Offers**: Push discount campaigns to CresceVendas platform
3. **Notify Users**: Send status updates via Telegram Bot
4. **Monitor Jobs**: Track execution status and metrics

## 🏗️ Architecture Patterns

### Database Layer (CRITICAL)
- **NEVER use Prisma Client** for queries - only for types in `database/generated/prisma/`
- **ALWAYS use Kysely** via `db` from `../factory/database.factory`
- **Soft deletes only**: Use `deletedAt` field, never hard delete
- **Promise pattern**: Use `.then()/.catch()` instead of `async/await` in services

```typescript
// ✅ CORRECT
import { db } from '../factory/database.factory';
db.selectFrom('users').selectAll().where('deletedAt', 'is', null).execute()

// ❌ WRONG
import { PrismaClient } from '../../database/generated/prisma';
const prisma = new PrismaClient();
```

### Environment & Configuration
- **NEVER use process.env** directly - ALWAYS use `EnvFactory`
- Critical env vars: `DATABASE_URL` (required), `JWT_SECRET`, `NODE_ENV`
- Use `EnvFactory.isDevelopment()` for conditional logic

```typescript
// ✅ CORRECT
import { EnvFactory } from '../factory/environment.factory';
const dbUrl = EnvFactory.get('DATABASE_URL');

// ❌ WRONG
const dbUrl = process.env.DATABASE_URL;
```

### API Response Format
- **Success**: `{ message: 'Portuguese message', data: result }`
- **Error**: `{ error: 'Portuguese error message' }`
- **NEVER** use `{ success: boolean, data: any }` format

### Validation Pattern (CRITICAL)
- **NEVER validate inside controllers** - use validators middleware
- **Two-layer validation**: `validators/` (request) + `schemas/` (business)
- **Always use Joi** for input validation with Portuguese messages

```typescript
// ✅ CORRECT Route Structure
router.post('/',
    requireAdmin,           // 1. Auth/Authorization
    EntityValidator.create, // 2. Input Validation
    EntityController.create // 3. Business Logic
);

// ✅ CORRECT Controller (No Validation)
static create(req: AuthenticatedRequest, res: Response) {
    const { name } = req.body; // Already validated!
    EntityService.create({ name })
        .then(result => res.json({ message: 'Criado com sucesso', data: result }))
        .catch(handleError);
}

// ❌ WRONG - Manual validation in controller
if (!name || name.length < 1) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
}
```

## 🛣️ File Structure Patterns

### Controllers
- File: `entity.controller.ts` (camelCase)
- Class: `EntityController` (PascalCase)
- Methods: `getAll`, `getById`, `create`, `update`, `delete`
- Static methods with `AuthenticatedRequest` from `../utils/auth`

### Services
- File: `entity.service.ts` (camelCase)
- Class: `EntityService`, Export: `entityService` (singleton)
- Return `Promise` with `.then()/.catch()` pattern
- Validate parameters before database calls

### Routes
- File: `entity.route.ts` or hierarchical like `jobs.config.route.ts`
- URLs: `/api/v1/entities` (plural, kebab-case for multi-word)
- Middleware order: auth → admin → controller
- Register in `routes/index.ts`

## 🔧 Development Workflows

### Database Setup
```bash
npm run db:setup    # Generate + Migrate + Seed
npm run build      # TypeScript compilation
npm run dev        # Development server
```

### Key Scripts Context
- Uses `tsx` for TypeScript execution without compilation
- Prisma schema in `database/prisma/schema.prisma`
- Generated types for Kysely in `src/types/database.ts`

### Integration Testing
- RP API integration for product sync (legacy: `fazTudo2.ts`)
- CresceVendas API for discount campaigns
- Telegram Bot for notifications and monitoring
- Jobs system replaces cron-based execution

## ⚠️ Migration Context (Current State)

### Legacy Bridge Required
- **server-node-fill** system still in production
- Jobs like `SyncProductsJob` must replicate `fazTudo2` logic
- Store configurations migrate from hardcoded ENV to database
- Telegram user lists move from static config to `NotificationChannel`

### Incomplete Implementation
- Controllers exist but need refactoring: `JobConfigurationController.ts`, `StoreController.ts`
- Services have duplicates: `jobConfiguration.service.ts` vs `JobConfigurationService.ts` (use camelCase)
- Routes created but not registered: `jobs.config.route.ts`, `notifications.route.ts`, `stores.route.ts`

### URL Structure (When Complete)
```
/api/v1/auth/*
/api/v1/integrations/*
/api/v1/jobs/configurations/*
/api/v1/jobs/executions/*
/api/v1/notifications/*
/api/v1/stores/*
```

## 🎯 Key Implementation Notes

- **Portuguese** for all user messages, errors, and logs
- **Job Scheduler** replaces cron jobs with configurable execution
- **Integration Manager** handles RP/CresceVendas APIs dynamically
- **Notification Service** supports multiple channels (Telegram, Email, Webhook)
- **Authentication** with JWT, role-based access (ADMIN/USER)

Use existing `auth.controller.ts` and `integration.controller.ts` as reference implementations - they follow the correct patterns.
