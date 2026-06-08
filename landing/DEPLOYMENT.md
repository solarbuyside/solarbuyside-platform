# Guia de Deployment - Solar Buy Side v2

## 📋 Índice
1. [Setup SSH no HostGator](#setup-ssh-no-hostgator)
2. [Deploy Manual](#deploy-manual)
3. [Deploy Automático via GitHub Actions](#deploy-automático-via-github-actions)
4. [Troubleshooting](#troubleshooting)
5. [Rollback](#rollback)

---

## Setup SSH no HostGator

### Pré-requisitos
- SSH key configurada no HostGator
- Repositório clonado via SSH no servidor
- Acesso ao cPanel ou terminal SSH

### Passos de Setup Inicial

#### 1. Acessar o servidor via SSH
```bash
ssh usuario@seu-servidor.com
```

#### 2. Criar estrutura de diretórios
```bash
mkdir -p ~/repos
mkdir -p ~/public_html
mkdir -p ~/deploy-logs
```

#### 3. Clonar o repositório
```bash
cd ~/repos
git clone git@github.com:gabrielfeelix/solar-buy-side-v2.git
cd solar-buy-side-v2
```

#### 4. Configurar permissões do script de deploy
```bash
chmod +x ~/deploy.sh
```

#### 5. Testar clonagem
```bash
ls -la ~/repos/solar-buy-side-v2
```

Você deve ver:
- `package.json`
- `src/`
- `vite.config.ts`
- `deploy.sh`

---

## Deploy Manual

### Executar o script de deploy
```bash
bash ~/deploy.sh
```

O script fará automaticamente:
1. ✅ Fazer `git pull` das atualizações
2. ✅ Instalar dependências (`npm install`)
3. ✅ Gerar build (`npm run build`)
4. ✅ Criar backup do `public_html`
5. ✅ Copiar build para `~/public_html/`
6. ✅ Validar que os arquivos foram copiados corretamente

### Esperado no output
```
[INFO] Iniciando deploy...
[INFO] Data: ...
[INFO] Fazendo pull do repositório...
[INFO] Pull concluído com sucesso
[INFO] Instalando dependências com npm...
[INFO] Dependências instaladas com sucesso
[INFO] Gerando build do projeto...
[INFO] Build concluído com sucesso
[INFO] Pasta dist validada
[INFO] Criando backup de ~/public_html...
[INFO] Backup criado com sucesso
[INFO] Limpando diretório ~/public_html...
[INFO] Copiando build para ~/public_html...
[INFO] ✓ Deploy concluído com sucesso!
```

---

## Deploy Automático via GitHub Actions

### 1. Configurar Secrets no GitHub

Acesse: **Repository → Settings → Secrets and variables → Actions**

Adicione os seguintes secrets:

| Secret | Valor | Exemplo |
|--------|-------|---------|
| `HOSTGATOR_HOST` | IP ou hostname do servidor | `seu-dominio.com` ou `123.45.67.89` |
| `HOSTGATOR_USER` | Usuário SSH | `seu_usuario` |
| `HOSTGATOR_SSH_KEY` | Chave privada completa (id_rsa) | Conteúdo do `~/.ssh/id_rsa` |
| `HOSTGATOR_SSH_PORT` | Porta SSH (opcional) | `22` (padrão) |

**⚠️ IMPORTANTE:**
- A chave privada deve conter o texto COMPLETO entre `-----BEGIN OPENSSH PRIVATE KEY-----` e `-----END OPENSSH PRIVATE KEY-----`
- Nunca commite a chave privada no repositório
- Use um secret para proteger a chave

### 2. Extrair a Chave Privada

No servidor HostGator:
```bash
cat ~/.ssh/id_rsa
```

Copie TUDO (começando com `-----BEGIN` e terminando com `-----END`)

### 3. Adicionar o Secret no GitHub

1. Abra a página de Secrets do seu repositório
2. Clique em "New repository secret"
3. Nome: `HOSTGATOR_SSH_KEY`
4. Cole a chave privada completa
5. Clique em "Add secret"

### 4. Workflow Automático

Agora, sempre que você fazer push para `main`:

```
user$ git add .
user$ git commit -m "seu mensagem"
user$ git push origin main
      ↓
[GitHub Actions dispara]
      ↓
1. Checkout do repositório
2. Setup Node.js 18
3. npm install
4. npm run lint (verificação)
5. npm run build (validação)
6. Conectar ao HostGator via SSH
7. Executar ~/deploy.sh
      ↓
Landing page atualizada automaticamente! ✅
```

### 5. Monitorar o Deploy

No GitHub:
1. Vá para **Actions**
2. Clique no workflow mais recente
3. Veja os detalhes e logs

---

## Troubleshooting

### Erro: "Permission denied (publickey)"
**Causa:** Chave SSH não está configurada no GitHub ou no HostGator

**Solução:**
```bash
# Verificar se a chave está adicionada ao ssh-agent
ssh-add ~/.ssh/id_rsa

# Testar conexão
ssh -T git@github.com
```

### Erro: "npm: command not found"
**Causa:** Node.js/npm não está instalado no HostGator

**Solução:**
1. Contacte o HostGator support para instalar Node.js
2. Ou instale manualmente via SSH (requer shell access)

### Erro: "dist folder not created"
**Causa:** Build falhou durante `npm run build`

**Solução:**
```bash
# Verificar erros de build
cd ~/repos/solar-buy-side-v2
npm run build

# Ver erros específicos
npm run lint
```

### Erro: "GitHub Action timeout"
**Causa:** Servidor lento ou build muito pesado

**Solução:**
Aumentar timeout no workflow (`.github/workflows/deploy.yml`):
```yaml
script_stop: true  # Stop on error
```

### Erro: "git pull failed"
**Causa:** Mudanças locais conflitantes no servidor

**Solução:**
```bash
cd ~/repos/solar-buy-side-v2
git status
git reset --hard origin/main
```

---

## Rollback

Se algo der errado após o deploy:

### 1. Rollback Manual

```bash
# Ver backups disponíveis
ls -la ~/backup_before_deploy_*

# Restaurar um backup específico
cp -r ~/backup_before_deploy_YYYYMMDD_HHMMSS/* ~/public_html/
```

### 2. Rollback Automático

O script `deploy.sh` faz rollback automático se:
- A cópia dos arquivos falhar
- O build não for gerado

Se o rollback automático não funcionou, execute manualmente:

```bash
# Confirmar que backup existe
ls ~/backup_before_deploy_*

# Restaurar
rm -rf ~/public_html/*
cp -r ~/backup_before_deploy_LATEST/* ~/public_html/
```

---

## Verificação Pós-Deploy

Após o deploy, verifique:

### 1. Arquivos foram copiados
```bash
ls -la ~/public_html
```

Você deve ver:
- `index.html`
- `assets/` (pasta com CSS/JS)

### 2. Acessar o site
```
https://seu-dominio.com
```

Verifique no navegador:
- Página carrega
- Sem erros no console (F12 → Console)
- Responsivo no mobile

### 3. Verificar tamanho do build
```bash
du -sh ~/repos/solar-buy-side-v2/dist
du -sh ~/public_html
```

---

## Monitoração Contínua

### Logs de Deploy

Os logs são salvos durante cada deploy:
```bash
# Ver último deploy
tail -100 ~/deploy-logs/latest.log

# Ver todos os deploys
ls -la ~/deploy-logs/
```

### Health Check (Opcional)

Para verificar se o site está up:
```bash
curl -I https://seu-dominio.com

# Esperado:
# HTTP/2 200
```

---

## Dicas Úteis

### Limpar Cache do Navegador
Se após deploy o site parece igual, limpe o cache:
- Chrome/Edge: `Ctrl+Shift+Delete`
- Firefox: `Ctrl+Shift+Delete`
- Safari: Menu → Develop → Empty Web Storage

### Variáveis de Ambiente

Se precisar de variáveis de ambiente diferentes em produção:

1. Crie um arquivo `.env` no HostGator:
```bash
# No servidor
nano ~/.env.production
```

2. Edite o `.github/workflows/deploy.yml` para carregar o arquivo

### Automatizar Builds Semanais

Se quiser fazer build automático mesmo sem commits:

```yaml
# No .github/workflows/deploy.yml
on:
  push:
    branches: ["main"]
  schedule:
    - cron: "0 0 * * 0"  # Toda segunda-feira à 00:00
```

---

## Support

Para problemas com:
- **GitHub Actions**: Veja os logs em Actions → Workflow
- **HostGator SSH**: Contacte o suporte do HostGator
- **Build/Deploy**: Rode `bash ~/deploy.sh` manualmente e veja o output

---

**Última atualização**: 2026-02-01
