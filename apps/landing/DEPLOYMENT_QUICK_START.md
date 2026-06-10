# Quick Start - Deploy Automático

## TL;DR - Resumo Rápido

### Para você (seu PC):
```bash
# Faça mudanças, depois:
bash test-build.sh
bash push-validated.sh
# Pronto! Deploy automático dispara ✨
```

### Dados que você precisa dar:
1. **HOSTGATOR_HOST** - IP ou host do servidor
2. **HOSTGATOR_USER** - Usuário SSH (ex: fran4942)
3. **HOSTGATOR_SSH_KEY** - Conteúdo de `~/.ssh/id_rsa` do servidor
4. **HOSTGATOR_SSH_PORT** - Porta SSH (normalmente 22)

---

## Como Funciona (Simplificado)

```
Você faz push no GitHub
    ↓
GitHub Action dispara automaticamente
    ↓
Conecta ao HostGator via SSH
    ↓
Executa deploy.sh (pull + npm install + npm run build + copia dist/)
    ↓
Site atualiza automaticamente no seu domínio
```

---

## Passos de Setup (Resumido)

### 1️⃣ No seu PC (já feito)
- ✅ SSH key criada
- ✅ SSH key adicionada no GitHub
- ✅ Repositório pronto com todos os arquivos

### 2️⃣ No HostGator (você precisa fazer)
```bash
# SSH key
ssh-keygen -t ed25519 -C "seu-email"
ssh-add ~/.ssh/id_rsa

# Estrutura
mkdir -p ~/repos ~/public_html

# Clone
cd ~/repos
git clone git@github.com:gabrielfeelix/solar-buy-side-v2.git

# Permissões
chmod +x ~/repos/solar-buy-side-v2/deploy.sh

# Testar manualmente
bash ~/deploy.sh
```

### 3️⃣ No GitHub (você precisa fazer)
1. Settings → Secrets and variables → Actions
2. Adicionar 4 secrets:
   - `HOSTGATOR_HOST`
   - `HOSTGATOR_USER`
   - `HOSTGATOR_SSH_KEY`
   - `HOSTGATOR_SSH_PORT` (opcional)

### 4️⃣ Testar
```bash
git add .
git commit -m "test"
git push origin main
# Esperar ~2 minutos
# Checar: https://seu-dominio.com
```

---

## Arquivos Importantes

| Arquivo | O que é | Para quem |
|---------|---------|----------|
| `deploy.sh` | Script de deploy no servidor | HostGator |
| `.github/workflows/deploy.yml` | GitHub Action | Automático |
| `test-build.sh` | Valida build localmente | Você (PC) |
| `push-validated.sh` | Push com validação | Você (PC) |
| `DEPLOYMENT.md` | Documentação completa | Referência |
| `GITHUB_SECRETS_SETUP.md` | Como configurar secrets | Guia passo a passo |
| `FINAL_CHECKLIST.md` | Checklist final | Verificar tudo |

---

## Uso Diário

### Fluxo Normal
```bash
# 1. Faça suas mudanças normalmente
# Edite arquivos, teste localmente, etc...

# 2. Teste o build
bash test-build.sh

# 3. Faça push
bash push-validated.sh
# Ou manualmente:
git add .
git commit -m "sua mensagem"
git push origin main

# 4. Esperar deploy (2-5 minutos)
# Monitore em: https://github.com/gabrielfeelix/solar-buy-side-v2/actions

# 5. Pronto! Site atualizado 🎉
```

### Fluxo com Erro
```bash
# Se test-build.sh falhar:
1. Veja o erro
2. Corrija no código
3. Rode test-build.sh novamente
4. Quando passar, faça push

# Se GitHub Action falhar:
1. Veja os logs em Actions
2. Procure no DEPLOYMENT.md (Troubleshooting)
3. Corrija e faça novo push
```

---

## Troubleshooting Rápido

### "Permission denied (publickey)"
```bash
# No HostGator:
ssh-add ~/.ssh/id_rsa
ssh -T git@github.com
```

### "npm: command not found"
Node.js não está instalado. Peça para HostGator instalar ou use outro provider.

### "dist folder not created"
```bash
cd ~/repos/solar-buy-side-v2
npm run build
npm run lint
```

### GitHub Action falha mas funciona localmente
Verifique os logs em: https://github.com/gabrielfeelix/solar-buy-side-v2/actions

---

## Scripts Úteis

```bash
# Testar build localmente
bash test-build.sh

# Push com validação automática
bash push-validated.sh

# Deploy manual no servidor
bash ~/deploy.sh

# Ver status do servidor
ssh usuario@seu-servidor.com "ls -la ~/public_html"

# Ver logs do último deploy
ssh usuario@seu-servidor.com "tail ~/deploy-logs/latest.log"
```

---

## Documentos de Referência

- **Documentação Completa**: Veja `DEPLOYMENT.md`
- **Configurar Secrets**: Veja `GITHUB_SECRETS_SETUP.md`
- **Checklist Final**: Veja `FINAL_CHECKLIST.md`

---

## Precisa de Ajuda?

1. Verifique `TROUBLESHOOTING` em `DEPLOYMENT.md`
2. Veja os logs no GitHub Actions
3. Rode `bash ~/deploy.sh` manualmente no servidor para debug
4. Cheque se os secrets estão corretos

---

**Resumo:**
- ✅ Setup simples e automático
- ✅ Deploy com 1 comando (`git push`)
- ✅ Rollback automático se falhar
- ✅ Documentação completa
- ✅ Scripts para debug

**Pronto?** Vá para `GITHUB_SECRETS_SETUP.md` para configurar os secrets!
