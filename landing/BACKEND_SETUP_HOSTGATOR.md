# Configuração do Backend no HostGator

## ⚠️ IMPORTANTE

O backend **NÃO está rodando em produção ainda**. Este guia mostra como configurá-lo.

---

## 🎯 Objetivo

Configurar o backend Node.js no HostGator para que a API funcione em produção.

---

## 📋 Pré-requisitos

- Acesso ao cPanel do HostGator
- Backend já presente no servidor em `/home/fran4942/api/` ou `~/repos/solar-buy-side-v2/backend/`
- Node.js habilitado no HostGator (geralmente já vem instalado)

---

## 🚀 Passo a Passo

### 1. Acessar cPanel

1. Faça login no cPanel do HostGator
2. Procure por **"Setup Node.js App"** ou **"Node.js Selector"**

### 2. Criar Nova Aplicação Node.js

Clique em **"Create Application"** e configure:

**Configurações:**
```
Node.js version: 18.x ou superior (mais recente disponível)
Application mode: Production
Application root: api (ou repos/solar-buy-side-v2/backend)
Application URL: (deixe em branco - não será acessado diretamente)
Application startup file: src/server.js
```

**Exemplo:**
```
Application root: /home/fran4942/api
Application startup file: src/server.js
Node.js version: 18.19.0
Environment: Production
```

### 3. Configurar Variáveis de Ambiente

Na mesma tela, adicione as variáveis de ambiente clicando em **"Environment Variables"**:

```bash
NODE_ENV=production
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=fran4942_solar_buyside
DB_USERNAME=fran4942_solar
DB_PASSWORD=Nerac47600@

JWT_SECRET=c1b47bf3e0ecd33cdf8d02d692595a37061a45333464e427eed8f131e2dba4f785a31788a54d7d4159abbf894f8c009359075ef37f9c02fac5128bb460caf6d0
JWT_EXPIRES_IN=7d

CORS_ORIGIN=https://solarbuyside.com.br,https://www.solarbuyside.com.br
```

### 4. Fazer Upload/Atualizar Arquivos do Backend

**Via SSH:**
```bash
# Acessar via SSH
ssh fran4942@solarbuyside.com.br

# Criar diretório se não existir
mkdir -p ~/api

# Clonar repo ou copiar backend
cd ~/repos/solar-buy-side-v2
cp -r backend/* ~/api/

# Ou se preferir, clonar direto
cd ~/api
git clone git@github.com:gabrielfeelix/solar-buy-side-v2.git temp
cp -r temp/backend/* .
rm -rf temp
```

**Via File Manager (cPanel):**
1. Vá em **File Manager**
2. Navegue até `/home/fran4942/api/`
3. Faça upload dos arquivos do backend via ZIP ou FTP

### 5. Instalar Dependências

**Via cPanel Node.js App:**
1. Volte para **"Setup Node.js App"**
2. Clique na aplicação criada
3. Clique em **"Run NPM Install"**

**Via SSH:**
```bash
cd ~/api
npm install --production
```

### 6. Iniciar Aplicação

**Via cPanel:**
1. Na tela da aplicação Node.js
2. Clique em **"Start App"** ou **"Restart App"**

**Via SSH:**
```bash
# O cPanel geralmente usa PM2 ou similar
# Não precisa executar manualmente, o cPanel cuida disso
```

### 7. Verificar se Está Rodando

**Via cPanel:**
- Status deve mostrar **"Running"** com uma bolinha verde

**Via SSH:**
```bash
# Verificar se a porta 5000 está em uso
lsof -i :5000

# Ou verificar processos Node
ps aux | grep node
```

**Via curl (local no servidor):**
```bash
curl http://localhost:5000/health
# Deve retornar: {"success":true,"message":"API is running","timestamp":"..."}
```

**Via browser (após proxy configurado):**
```
https://solarbuyside.com.br/api/health
```

---

## 🔧 Troubleshooting

### Erro: "Application failed to start"

**Possíveis causas:**
1. Arquivo `src/server.js` não encontrado
2. Dependências não instaladas
3. Variáveis de ambiente faltando
4. Porta já em uso

**Solução:**
```bash
# Verificar logs
cd ~/api
cat logs/startup.log
# ou
pm2 logs
```

### Erro: "Port 5000 already in use"

**Solução:**
1. Mude a porta no cPanel para 5001, 5002, etc.
2. Atualize o `.htaccess` com a nova porta:
```apache
RewriteRule ^api/(.*)$ http://localhost:5001/api/$1 [P,L]
```

### Erro: "Database connection failed"

**Solução:**
1. Verifique as credenciais do banco no cPanel → MySQL Databases
2. Atualize as variáveis de ambiente com os valores corretos
3. Reinicie a aplicação

### Erro: 502 Bad Gateway ao acessar /api

**Causas:**
1. Backend não está rodando
2. Proxy no .htaccess configurado incorretamente
3. Porta incorreta

**Solução:**
```bash
# Verificar se backend está rodando
curl http://localhost:5000/health

# Se não estiver, reiniciar via cPanel
# Ou verificar logs para ver o erro
```

---

## 📊 Estrutura de Arquivos Esperada

```
/home/fran4942/
├── api/                          # Backend Node.js
│   ├── src/
│   │   ├── server.js            # ← Application startup file
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── middlewares/
│   ├── package.json
│   ├── .env                     # ← Variáveis de ambiente
│   └── node_modules/
├── public_html/                 # Frontend (build do React)
│   ├── index.html
│   ├── assets/
│   └── .htaccess                # ← Com proxy para /api
└── repos/
    └── solar-buy-side-v2/       # Repositório Git
```

---

## ✅ Checklist de Configuração

- [ ] Node.js App criado no cPanel
- [ ] Application root configurado corretamente
- [ ] Application startup file: `src/server.js`
- [ ] Variáveis de ambiente configuradas
- [ ] Dependências instaladas (`npm install`)
- [ ] Aplicação iniciada (status: Running)
- [ ] Teste `curl http://localhost:5000/health` retorna JSON
- [ ] `.htaccess` atualizado com proxy
- [ ] Teste `https://solarbuyside.com.br/api/health` retorna JSON
- [ ] Login funciona no frontend

---

## 🔐 Segurança

### Variáveis Sensíveis

⚠️ **NUNCA** commite o arquivo `.env` para o repositório!

As variáveis de ambiente devem ser configuradas **apenas no cPanel** ou via SSH.

### Banco de Dados

Certifique-se de que as credenciais do MySQL estão corretas e seguras.

---

## 📞 Suporte

Se algo não funcionar:

1. Verifique os logs da aplicação no cPanel
2. Teste `curl http://localhost:5000/health` via SSH
3. Verifique se o proxy `.htaccess` está correto
4. Reinicie a aplicação Node.js no cPanel

---

## 🎉 Próximos Passos

Após configurar o backend:

1. ✅ Frontend vai automaticamente detectar e usar a API em produção
2. ✅ Login vai funcionar
3. ✅ Analytics vai funcionar
4. ✅ Todas as features do admin vão funcionar

**Não é necessário rebuild do frontend!** O código já detecta automaticamente se está em produção ou desenvolvimento.

---

## 📝 Observações

- O `.htaccess` já está configurado com o proxy para `/api/*`
- O frontend já detecta automaticamente o ambiente (dev/prod)
- A porta padrão é 5000, mas pode ser alterada se necessário
- O backend precisa estar sempre rodando para a API funcionar
