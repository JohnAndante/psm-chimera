# Git Instructions - PSM Chimera

## 🎯 Filosofia de Commits

Este projeto segue uma filosofia de commits **atômicos**, **funcionais** e organizados por **feature**. Cada commit deve representar uma unidade lógica e funcional de trabalho.

### ⚡ Princípios Fundamentais

1. **NUNCA** commitar código não funcional
2. Commits devem ser **atômicos** - uma mudança lógica por commit
3. Cada commit deve deixar o projeto em estado **funcional**
4. Preferir commits pequenos e focados a commits gigantes

## 📝 Padrão de Nomenclatura

```
#[número da issue] - [tipo]: [descrição breve em inglês]
```

### Tipos de Commit

- **feat**: Nova funcionalidade
- **refactor**: Refatoração de código existente
- **fix**: Correção de bug
- **docs**: Documentação
- **lint**: Ajustes de linting/formatação
- **test**: Testes
- **chore**: Tarefas de manutenção

### Exemplos

```bash
#123 - feat: add user authentication endpoints
#124 - refactor: convert ProductService to singleton pattern
#125 - fix: resolve Kysely query syntax error
#126 - docs: update API documentation for sync endpoints
#127 - lint: fix ESLint warnings in controllers
```

## 🔄 Estratégias de Commit

### Para Features Novas

**Opção 1: Ordem Inversa (Recomendada)**

```bash
git commit -m "#123 - feat: add user types and interfaces"
git commit -m "#123 - feat: add user validation schemas"
git commit -m "#123 - feat: add user service layer"
git commit -m "#123 - feat: add user controller"
git commit -m "#123 - feat: add user routes"
```

**Opção 2: Mega Commit (Apenas para features pequenas)**

```bash
git commit -m "#123 - feat: add complete user management feature"
```

### Para Refatorações

**Sempre incluir todas as dependências afetadas:**

```bash
# Exemplo: Renomeando um arquivo
git commit -m "#124 - refactor: rename ProductService and update all imports"

# Exemplo: Mudando estrutura
git commit -m "#125 - refactor: move interfaces to types folder with import updates"
```

### Para Correções

```bash
# Correção pontual
git commit -m "#126 - fix: resolve singleton pattern in ProductService"

# Correção com dependências
git commit -m "#127 - fix: correct promise chain pattern in all controllers"
```

## 🚀 Workflow de Commit

### 1. Verificar Estado

```bash
git status
git diff
```

### 2. Testar Funcionalidade

```bash
# Garantir que tudo está funcionando
npm run build
npm run test
```

### 3. Stage Changes

```bash
# Para commits atômicos, stage apenas os arquivos relacionados
git add specific-files

# Ou para tudo (cuidado!)
git add .
```

### 4. Commit

```bash
git commit -m "#[issue] - [tipo]: [descrição]"
```

### 5. Push

```bash
git push origin [branch-name]
```

## 📋 Checklist Pré-Commit

- [ ] Código compila sem erros
- [ ] Testes passam (se existirem)
- [ ] Funcionalidade está completa e funcional
- [ ] Commit message segue o padrão
- [ ] Apenas arquivos relacionados foram incluídos
- [ ] Imports e dependências foram atualizados

## 🔧 Casos Especiais

### Movimentação de Arquivos

```bash
# Sempre incluir o rename + updates em um commit
git mv old-file.ts new-file.ts
# ... update imports ...
git commit -m "#123 - refactor: rename service file and update imports"
```

### Mudanças de Estrutura

```bash
# Mover interfaces para pasta types
git commit -m "#124 - refactor: reorganize interfaces to types folder"
```

### Correções de Padrão

```bash
# Converter try/catch para promise chains
git commit -m "#125 - refactor: convert controllers to promise chain pattern"
```

## ❌ Evitar

- Commits com mensagens vagas: "fix stuff", "update code"
- Commits que quebram a aplicação
- Misturar tipos diferentes de mudança em um commit
- Commits gigantes com dezenas de arquivos não relacionados
- Esquecer de atualizar dependências após mudanças estruturais

## ✅ Exemplos de Bons Commits

```bash
#001 - feat: add Kysely database factory with singleton pattern
#002 - feat: create product types and interfaces
#003 - feat: implement product service with promise chains
#004 - feat: add product controller with error handling
#005 - feat: register product routes in main router
#006 - refactor: convert ProductService from static to singleton
#007 - refactor: move product interfaces to types folder
#008 - fix: correct product service import paths after type move
#009 - docs: update service architecture documentation
#010 - lint: fix TypeScript strict mode warnings
```

---

*Mantendo o código sempre funcional, organizado e com histórico claro! 🎯*
