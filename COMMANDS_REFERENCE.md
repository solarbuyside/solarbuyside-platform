# Referência Rápida de Comandos

## 📍 No seu PC (Windows/Mac/Linux)

### Desenvolvimento
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Fazer build
npm run build

# Ver preview do build
npm run preview

# Rodar linter
npm run lint
```

### Deploy
```bash
# Validar que o build vai funcionar
bash test-build.sh

# Fazer push com validação automática
bash push-validated.sh

# Ou manualmente
git add .
git commit -m "sua mensagem"
git push origin main
```

---

## 🖥️ No HostGator (Servidor via SSH)

### Conectar
```bash
ssh seu-usuario@seu-servidor.com
```

### Estrutura
```bash
# Ver repositório clonado
ls -la ~/repos/solar-buy-side-v2/

# Ver site publicado
ls -la ~/public_html/

# Ver backups
ls -la ~/backup_before_deploy_*/
```

### Deploy
```bash
# Deploy manual
bash ~/deploy.sh

# Ver últimos logs
tail -100 ~/deploy-logs/latest.log

# Ver todos os logs
ls -la ~/deploy-logs/
```

### Troubleshooting
```bash
# Testar git
ssh -T git@github.com

# Fazer pull manual
cd ~/repos/solar-buy-side-v2
git pull

# Fazer build manual
npm install
npm run build

# Ver tamanho da build
du -sh ~/repos/solar-buy-side-v2/dist

# Ver tamanho do site publicado
du -sh ~/public_html
```

### Rollback (Restaurar Backup)
```bash
# Ver backups disponíveis
ls -la ~/backup_before_deploy_*

# Listar arquivos de um backup
ls -la ~/backup_before_deploy_YYYYMMDD_HHMMSS/

# Restaurar um backup
rm -rf ~/public_html/*
cp -r ~/backup_before_deploy_YYYYMMDD_HHMMSS/* ~/public_html/
```

---

## 🔧 GitHub (Web)

### Secrets
```
Acessar:
Settings → Secrets and variables → Actions → New repository secret

Secrets necessários:
- HOSTGATOR_HOST
- HOSTGATOR_USER
- HOSTGATOR_SSH_KEY
- HOSTGATOR_SSH_PORT (opcional)
```

### Actions
```
Acessar:
https://github.com/gabrielfeelix/solar-buy-side-v2/actions

Ver últimos deploys:
Clicar no workflow mais recente
Ver logs detalhados
```

### Commits
```
Visualizar:
https://github.com/gabrielfeelix/solar-buy-side-v2/commits/main

Ver deployment do commit:
Clicar no ✓ ou ✗ ao lado do commit
```

---

## 📊 Verificações

### Verificar se Deploy Funcionou
```bash
# No seu PC
curl -I https://seu-dominio.com
# Esperado: HTTP/2 200

# No servidor
curl -I http://localhost
# Esperado: HTTP/1.1 200

# Testar linter
npm run lint

# Ver erros de build
npm run build
```

### Verificar Tamanhos
```bash
# Seu PC
du -sh dist/
du -sh node_modules/

# Servidor
ssh usuario@servidor "du -sh ~/repos/solar-buy-side-v2/dist"
ssh usuario@servidor "du -sh ~/public_html"
ssh usuario@servidor "du -sh ~/repos/solar-buy-side-v2/node_modules"
```

### Verificar Permissões
```bash
# No servidor
ls -l ~/deploy.sh
# Esperado: rwx (755)

ls -l ~/public_html/index.html
# Esperado: rw- (644)
```

---

## 🔍 Debugging

### Build não passa localmente
```bash
npm run lint
npm run build
# Veja o erro e corrija
```

### GitHub Action falha
```
1. Abra: https://github.com/gabrielfeelix/solar-buy-side-v2/actions
2. Clique no workflow que falhou
3. Veja a step que falhou e o erro
4. Corrija e faça novo push
```

### Deploy não funciona no servidor
```bash
# SSH para o servidor
ssh usuario@servidor

# Execute manualmente
bash ~/deploy.sh

# Se falhar, veja os erros detalhados
# Se passar, tudo deve estar ok
```

### Site não atualiza
```bash
# 1. Aguarde 2-5 minutos
# 2. Limpe cache: Ctrl+Shift+Delete no navegador
# 3. Verifique se foi publicado:
curl https://seu-dominio.com | head -20

# 4. Se ainda não atualizar:
ssh usuario@servidor "ls -la ~/public_html/"
# Veja se index.html tem data recente
```

---

## 🚀 Workflow Completo

### Desenvolvendo
```bash
# Terminal 1: Dev server
npm run dev

# Seu editor: Edite os arquivos
# Salve para auto-reload via HMR

# Quando pronto para deploy:
```

### Antes de fazer Push
```bash
# Terminal: Validar tudo
bash test-build.sh

# Se passou:
npm run lint  # Opcional, já rodado acima
```

### Fazer Deploy
```bash
# Terminal: Push com validação
bash push-validated.sh

# Ou manualmente:
git add .
git commit -m "mensagem"
git push origin main
```

### Monitorar Deploy
```bash
# Abra no navegador:
https://github.com/gabrielfeelix/solar-buy-side-v2/actions

# Acompanhe o workflow em tempo real
# Espere até ver ✅ verde ou ❌ vermelho
```

### Verificar Resultado
```bash
# Abra seu site no navegador
https://seu-dominio.com

# Limpe cache se necessário (Ctrl+Shift+Delete)
# Veja sua mudança refletida
```

---

## 📋 Quick Lookup

| Tarefa | Comando |
|--------|---------|
| Dev | `npm run dev` |
| Build | `npm run build` |
| Lint | `npm run lint` |
| Test build | `bash test-build.sh` |
| Push com validação | `bash push-validated.sh` |
| Deploy manual | `bash ~/deploy.sh` (servidor) |
| Ver logs | `tail ~/deploy-logs/latest.log` (servidor) |
| Rollback | `cp -r ~/backup_*/* ~/public_html/` (servidor) |
| Ver Actions | GitHub → Actions |
| Ver Secrets | GitHub → Settings → Secrets |

---

## 🆘 SOS

Se algo quebrou, execute nesta ordem:

```bash
# 1. No seu PC, valide o build
bash test-build.sh

# 2. Se passou, veja os logs do GitHub
# GitHub → Actions → Workflow mais recente

# 3. Se GitHub falhou, veja o erro específico
# Corrija no código, faça novo push

# 4. Se GitHub passou mas site não atualizou
ssh usuario@servidor "bash ~/deploy.sh"

# 5. Se tudo falhou, faça rollback
ssh usuario@servidor "cp -r ~/backup_before_deploy_*/* ~/public_html/"

# 6. Veja os logs
ssh usuario@servidor "tail -100 ~/deploy-logs/latest.log"
```

---

**Última atualização**: 2026-02-01
