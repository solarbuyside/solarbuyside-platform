# Solar Buy-Side API Backend

API REST para gerenciar o site Solar Buy-Side, incluindo newsletter, leads do e-book, autenticação de admin e gerenciamento de conteúdo.

## 🚀 Instalação

```bash
cd backend
npm install
```

## ⚙️ Configuração

1. Configure as variáveis de ambiente no arquivo `.env`:

```env
NODE_ENV=production
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=fran4942_solar_buyside
DB_USERNAME=fran4942_solar
DB_PASSWORD=your_secure_password

JWT_SECRET=generate_a_strong_random_secret_key_here
JWT_EXPIRES_IN=7d

CORS_ORIGIN=*
```

## 🏃 Executar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## 🧪 Testes com Docker

Para testar os endpoints automaticamente usando Docker:

1. **Iniciar o container MySQL de teste:**
```bash
docker compose up -d
```

2. **Executar os testes:**
```bash
bash scripts/test-endpoints.sh
```

O script irá:
- Aguardar o serviço ficar healthy (healthcheck com retry)
- Testar todos os endpoints principais
- Exibir um resumo com PASS/FAIL

3. **Parar o container:**
```bash
docker compose down
```

## 📚 Endpoints da API

### Health Check
- **GET** `/health` - Verifica se a API está funcionando

### Autenticação

#### Login
- **POST** `/api/auth/login`
- Body:
```json
{
  "email": "your_admin_email@example.com",
  "password": "your_secure_password"
}
```
- Response:
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "name": "Admin User"
    },
    "token": "eyJhbG***...redacted..."
  }
}
```

#### Verificar Token
- **GET** `/api/auth/verify`
- Headers: `Authorization: Bearer {token}`

### Newsletter

#### Cadastrar Email
- **POST** `/api/newsletter/subscribe`
- Body:
```json
{
  "email": "usuario@example.com"
}
```

#### Listar Inscritos (Admin)
- **GET** `/api/newsletter/subscribers`
- Headers: `Authorization: Bearer {token}`

### E-book

#### Salvar Lead
- **POST** `/api/ebook/lead`
- Body:
```json
{
  "nome": "João",
  "sobrenome": "Silva",
  "email": "joao@example.com",
  "celular": "11999999999"
}
```

#### Listar Leads (Admin)
- **GET** `/api/ebook/leads`
- Headers: `Authorization: Bearer {token}`

### Conteúdo

#### Listar Todas as Seções
- **GET** `/api/content/sections`

#### Buscar Seção Específica
- **GET** `/api/content/sections/:sectionId`

#### Atualizar Seção (Admin)
- **PUT** `/api/content/sections/:sectionId`
- Headers: `Authorization: Bearer {token}`
- Body:
```json
{
  "section_name": "Hero Section",
  "texts": {
    "title": "Título da seção",
    "subtitle": "Subtítulo da seção"
  },
  "images": {
    "hero": "/assets/hero.jpg"
  }
}
```

#### Buscar Assets Globais
- **GET** `/api/content/assets`

#### Atualizar Asset Global (Admin)
- **PUT** `/api/content/assets`
- Headers: `Authorization: Bearer {token}`
- Body:
```json
{
  "key": "logo",
  "value": "/assets/novo-logo.svg"
}
```

#### Buscar Configurações Globais
- **GET** `/api/content/settings`

#### Atualizar Configuração Global (Admin)
- **PUT** `/api/content/settings`
- Headers: `Authorization: Bearer {token}`
- Body:
```json
{
  "key": "whatsappNumber",
  "value": "5511999999999"
}
```

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Para rotas protegidas, inclua o token no header:

```
Authorization: Bearer {seu-token-jwt}
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas

1. **admin_users** - Usuários administradores
2. **newsletter_subscribers** - Inscritos na newsletter
3. **ebook_leads** - Leads do e-book
4. **content_sections** - Seções de conteúdo editável
5. **global_assets** - Assets globais (favicon, logo)
6. **global_settings** - Configurações globais (WhatsApp, link de compra)

## 📦 Deploy no HostGator

1. Fazer upload dos arquivos para `/home1/fran4942/api/` ou similar
2. Instalar dependências: `npm install --production`
3. Configurar `.env` com as credenciais corretas
4. Iniciar servidor: `npm start`
5. Configurar Node.js App no cPanel apontando para `src/server.js`

## 🛡️ Segurança

- Todas as senhas devem ser hashadas com bcrypt (TODO)
- JWT token expira em 7 dias
- Rate limiting de 100 requisições por 15 minutos
- CORS configurável via variável de ambiente
- Helmet.js para segurança adicional

## 📝 TODO

- [ ] Implementar hash de senhas com bcrypt
- [ ] Adicionar testes automatizados
- [ ] Implementar refresh token
- [ ] Adicionar logs estruturados
- [ ] Implementar paginação nos endpoints de listagem
- [ ] Adicionar validação de schemas com Joi ou Yup
