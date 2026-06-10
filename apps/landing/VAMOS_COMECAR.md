# 🚀 VAMOS COMEÇAR - Deploy HostGator

## ⏱️ 15 minutos até ter deploy seguro funcionando

---

## 📍 VOCÊ ESTÁ AQUI

```
1. ✅ SSH com GitHub configurado
2. ✅ Repo com scripts e docs pronto
3. ⏳ AGORA: Rodar auditoria + deploy no HostGator
```

---

## 🎯 EM 3 PASSOS

### PASSO 1️⃣ (1 min): Conectar

```bash
ssh seu-usuario@seu-servidor-hostgator.com
```

---

### PASSO 2️⃣ (10 min): Rodar Script Único

Copie e cole TODO isto no HostGator:

```bash
curl -fsSL https://raw.githubusercontent.com/gabrielfeelix/solar-buy-side-v2/main/run-full-audit-and-deploy.sh -o ~/run-full-audit-and-deploy.sh && sed -i 's/\r$//' ~/run-full-audit-and-deploy.sh && chmod +x ~/run-full-audit-and-deploy.sh && ~/run-full-audit-and-deploy.sh
```

Vai pedir: `Do you want to continue with SAFE DEPLOY? (yes/no):`

Responda: `yes`

---

### PASSO 3️⃣ (5 min): Validar e Enviar Output

Copie TODO o output do script e **mande aqui no chat**.

Claude vai:
- ✅ Analisar resultado
- ✅ Indicar próximos passos (GitHub Secrets)
- ✅ Validar tudo está correto

---

## 📋 O Que o Script Faz

### Fase 1-2: AUDITORIA (SEM MUDANÇAS)
```
✓ Detecta WEBROOT (~/public_html ou ~/domains/*/public_html)
✓ Verifica Node/NPM/Git
✓ Valida repositório
✓ Verifica .htaccess, robots.txt, etc
✓ Lista arquivos existentes
✓ Coleta informações do sistema
```

### Fase 3: DEPLOY SEGURO (COM BACKUP)
```
✓ Clona/atualiza repo
✓ Faz npm install
✓ Faz npm run build
✓ BACKUP automático (antes de mudança)
✓ Publica com rsync (seguro!)
✓ Preserva .htaccess
✓ Rollback automático se erro
✓ Valida resultado
```

---

## 🔒 Segurança Garantida

- ✅ **Nunca** usa `rm -rf ~/public_html/*`
- ✅ **Sempre** faz backup antes
- ✅ Usa `rsync --delete` (seguro)
- ✅ Preserva arquivos importantes
- ✅ Rollback automático em erro
- ✅ Logs claros e rastreáveis

---

## 📊 Sucesso: Você Verá

```
=== AUDIT COMPLETE ===
>>> COPY THE OUTPUT ABOVE AND SEND TO CLAUDE <<<

Do you want to continue with SAFE DEPLOY? (yes/no): yes

=== PHASE 3.3: RUNNING SAFE DEPLOY ===
========================================
[INFO] Using WEBROOT: /home/seu-usuario/public_html
[INFO] Creating backup...
[INFO] ✓ Backup complete
[INFO] Pulling latest code
[INFO] ✓ Repository updated
[INFO] Installing dependencies
[INFO] ✓ Dependencies installed
[INFO] Building
[INFO] ✓ Build completed
[INFO] ✓ Build validated: XXX MB (YYY files)
[INFO] Publishing build to WEBROOT...
[INFO] ✓ Files published
[INFO] ✓ Deployment complete
========================================
```

---

## ❓ Dúvidas?

| Pergunta | Resposta |
|----------|----------|
| Como faço SSH? | Terminal, PuTTY, Git Bash, WSL, etc |
| Não tenho acesso SSH? | Peça para HostGator via cPanel |
| Deu erro? | Mande output para Claude |
| Posso fazer rollback? | Sim! Script faz automático se erro |
| E depois? | Configure GitHub Secrets (Claude instrui) |

---

## 🚀 COMEÇAR

**Abra um terminal e copie:**

```bash
ssh seu-usuario@seu-servidor-hostgator.com
```

**Depois cole no HostGator:**

```bash
curl -fsSL https://raw.githubusercontent.com/gabrielfeelix/solar-buy-side-v2/main/run-full-audit-and-deploy.sh -o ~/run-full-audit-and-deploy.sh && sed -i 's/\r$//' ~/run-full-audit-and-deploy.sh && chmod +x ~/run-full-audit-and-deploy.sh && ~/run-full-audit-and-deploy.sh
```

**Depois:**

1. Responda `yes` quando pedir
2. Copie output
3. Mande aqui no chat

---

## 📞 Próximas Fases

```
Hoje: Auditoria + Deploy
    ↓
Depois: Configurar GitHub Secrets
    ↓
Depois: GitHub Actions automático
    ↓
Pronto! Deploy automático no push 🎉
```

---

## ✅ Checklist

- [ ] Tenho acesso SSH HostGator
- [ ] Tenho usuário e host à mão
- [ ] Terminal aberto
- [ ] Pronto para copiar/colar

**Tudo? Começa agora!** 🚀
