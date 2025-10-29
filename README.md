# 🍕 Goomer Menu API

API RESTful para gerenciamento de cardápios de restaurantes com suporte a produtos, promoções dinâmicas e controle de visibilidade.

## 🚀 Tecnologias

- **Node.js** 22 + **TypeScript**
- **Express** - Framework web
- **PostgreSQL** 16 - Banco de dados
- **TypeORM** - Migrations
- **Docker** - Containerização
- **Jest** - Testes

## ✨ Funcionalidades

### Obrigatórias

- ✅ CRUD completo de Produtos (nome, preço, categoria, visibilidade)
- ✅ CRUD completo de Promoções (desconto, dias da semana, horários)
- ✅ Endpoint de Cardápio com produtos visíveis e promoções ativas
- ✅ Validação de horários (formato HH:mm, intervalo mínimo 15 minutos)
- ✅ Aplicação automática de promoções baseada em dia/horário

### Opcionais (Implementadas)

- ✅ Ordenação customizada de produtos (`display_order`)
- ✅ Suporte a timezone (parâmetro `timezone`)
- ✅ Promoções que cruzam meia-noite (ex: 22:00 - 02:00)

## 📋 Pré-requisitos

- Docker e Docker Compose instalados

### Variáveis de Ambiente

O projeto utiliza dois arquivos de configuração:

**`.env`** (Desenvolvimento local sem Docker):

```properties
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=root
DB_NAME=goomer_menu
DB_SSL=false
```

**`.env.docker`** (Desenvolvimento com Docker):

```properties
NODE_ENV=development
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=root
DB_NAME=goomer_menu
DB_SSL=false
```

A diferença é o `DB_HOST`:

- `localhost` - Para conectar no PostgreSQL rodando na máquina local
- `db` - Para conectar no PostgreSQL rodando no container Docker

## 🐳 Como Rodar

### 1. Clone e configure

```bash
git clone https://github.com/victtorferreira/goomer_dev.git
cd goomer-menu-api
```

**Configuração de ambiente:**

O projeto possui dois arquivos de ambiente:

- `.env` - Para rodar localmente **sem Docker** (conecta no PostgreSQL local via `localhost`)
- `.env.docker` - Para rodar **com Docker** (conecta no PostgreSQL do container via hostname `db`)

**Para rodar com Docker (recomendado):**

```bash
cp .env.docker .env
```

**Para rodar localmente sem Docker:**

```bash
cp .env .env  # Já está configurado para localhost
```

> **Nota:** Se você usar Docker (recomendado), certifique-se de que o `.env` esteja apontando para `DB_HOST=db`.

### 2. Suba os containers

```bash
docker-compose up --build -d
```

### 3. Execute as migrations

```bash
docker-compose exec api npm run migration:run
```

### 4. Acesse a API

- **API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **pgAdmin**: http://localhost:8080 (admin@admin.com / admin)

## 📡 Endpoints

### Produtos

```bash
POST   /api/products      # Criar produto
GET    /api/products      # Listar (filtros: ?category=&visible=)
GET    /api/products/:id  # Buscar por ID
PUT    /api/products/:id  # Atualizar
DELETE /api/products/:id  # Deletar (cascade de promoções)
```

**Exemplo de criação:**

```json
{
  "name": "Pizza Margherita",
  "price": 45.9,
  "category": "Pratos principais",
  "visible": true,
  "display_order": 1
}
```

**Categorias válidas:** `Entradas`, `Pratos principais`, `Sobremesas`, `Bebidas`

### Promoções

```bash
POST   /api/promotions      # Criar promoção
GET    /api/promotions      # Listar (filtro: ?product_id=)
GET    /api/promotions/:id  # Buscar por ID
PUT    /api/promotions/:id  # Atualizar
DELETE /api/promotions/:id  # Deletar
```

**Exemplo de criação:**

```json
{
  "product_id": "uuid-do-produto",
  "description": "Happy Hour",
  "discount_percentage": 50,
  "days_of_week": [1, 2, 3, 4, 5],
  "start_time": "18:00",
  "end_time": "20:00"
}
```

**Observações:**

- `days_of_week`: 0=Domingo, 1=Segunda, ..., 6=Sábado
- `discount_percentage`: 0 a 100
- O preço promocional é calculado automaticamente

### Cardápio

```bash
GET /api/menu?category=&timezone=
```

Retorna produtos visíveis com promoções aplicadas baseado no horário atual.

**Exemplo de resposta:**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Pizza Margherita",
      "category": "Pratos principais",
      "original_price": 45.9,
      "current_price": 22.95,
      "has_active_promotion": true,
      "promotion": {
        "description": "Happy Hour",
        "promotional_price": 22.95
      },
      "display_order": 1
    }
  ]
}
```

## 🧪 Testes

```bash
# Todos os testes
docker-compose exec api npm test

# Apenas unitários
docker-compose exec api npm run test:unit

# Apenas integração
docker-compose exec api npm run test:integration

# Com cobertura
docker-compose exec api npm run test:coverage
```

## 📁 Estrutura

```
src/
├── config/           # Database & TypeORM
├── controllers/      # Recebe requisições HTTP
├── services/         # Lógica de negócio
├── repositories/     # Queries SQL (puro)
├── models/           # Interfaces & DTOs
├── routes/           # Definição de rotas
├── validators/       # Middlewares de validação
├── migrations/       # Migrations TypeORM
├── tests/
│   ├── integration/  # Testes E2E
│   └── unit/         # Testes com mocks
└── utils/            # Helpers
```

## 🎯 Decisões Técnicas

### 1. Arquitetura em Camadas

**Controller → Service → Repository** para separação de responsabilidades, facilitando testes e manutenção.

### 2. SQL Puro

Conforme requisito, todas as queries foram escritas em SQL puro (não query builder):

```typescript
const query = `SELECT * FROM products WHERE visible = $1`;
const result = await pool.query(query, [true]);
```

### 3. Cálculo Automático de Preço Promocional

O preço promocional é calculado no backend baseado no `discount_percentage`:

```typescript
promotional_price = original_price * (1 - discount_percentage / 100);
```

Isso garante consistência e evita divergências entre desconto e preço final.

### 4. Timezone com API Nativa

Uso de `Intl.DateTimeFormat` (nativo do JS) em vez de bibliotecas externas:

- Sem dependências extras
- Suporte completo a timezones IANA
- Performance superior

### 5. Suporte a Promoções Overnight

Lógica especial para promoções que cruzam meia-noite (ex: 22:00 - 02:00):

```typescript
if (endMinutes > startMinutes) {
  return current >= start && current <= end; // Normal
} else {
  return current >= start || current <= end; // Cruza meia-noite
}
```

### 6. Docker Multi-Stage Build

Build em 2 estágios (builder + runtime) para imagem otimizada e builds mais rápidos.

## 🚧 Desafios Encontrados

### 1. Preço Promocional NULL

**Problema:** Campo `promotional_price` era salvo como NULL no banco.

**Causa:** O service validava `promotional_price` vindo do DTO, mas apenas `discount_percentage` era enviado.

**Solução:** Removi validação incorreta e movi cálculo para o repository, garantindo que o preço seja calculado antes do INSERT.

### 2. Código Não Atualizava no Docker

**Problema:** Mudanças no código não apareciam após rebuild.

**Causa:** Volume `.:/app` sobrescrevia a pasta `/app/dist` compilada.

**Solução:** Adicionei volumes anônimos para proteger pastas geradas:

```yaml
volumes:
  - .:/app
  - /app/node_modules
  - /app/dist
```

### 3. Perda de Contexto `this`

**Problema:** Erro ao chamar `menuService` dentro do controller.

**Causa:** Passar métodos de classe para rotas Express perde o contexto `this`.

**Solução:** Converti métodos para arrow functions que capturam o `this` léxico:

```typescript
getMenu = async (req, res) => {
  /* ... */
};
```

### 4. Jest e Módulos ESM

**Problema:** Jest não reconhecia o pacote `uuid` (ESM).

**Solução:** Configurei `transformIgnorePatterns` e `moduleNameMapper` no Jest para transformar o uuid:

```javascript
transformIgnorePatterns: ["node_modules/(?!(uuid)/)"];
```

### 5. Validação de Intervalo Mínimo

**Problema:** Garantir 15 minutos mínimos, considerando horários que cruzam meia-noite.

**Solução:** Converti horários para minutos totais e tratei caso especial quando end < start:

```typescript
if (endTotal < startTotal) {
  return 1440 - startTotal + endTotal >= minMinutes;
}
```

### 6. Migration com Constraint Inexistente

**Problema:** Migration tentava dropar constraint que não existia.

**Solução:** Adicionei verificação condicional:

```sql
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints
             WHERE constraint_name = 'nome_constraint') THEN
    ALTER TABLE ... DROP CONSTRAINT ...;
  END IF;
END $$;
```

## 🔮 Melhorias Futuras

- [ ] Autenticação JWT
- [ ] Rate limiting
- [ ] Paginação
- [ ] Cache com Redis
- [ ] Upload de imagens de produtos
- [ ] Documentação Swagger/OpenAPI
- [ ] CI/CD com GitHub Actions
- [ ] Soft delete (histórico)
- [ ] Logs estruturados

## 📄 Licença

MIT

## 👨‍💻 Autor

**[Victor Ferreira]**

- GitHub: [@victtorferreira](https://github.com/victtorferreira)
- LinkedIn: [Victor Ferreira](https://www.linkedin.com/in/victor-ferreirah/)
- Email: devclips.js@gmail.com

---
