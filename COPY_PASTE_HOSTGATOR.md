# HostGator - Copiar e Colar (Fase 1, 2 e 3)

## 📋 PREPARAÇÃO

Tenha à mão:
- ✅ Seu usuário SSH HostGator
- ✅ Seu servidor/host HostGator
- ✅ Terminal SSH aberto (PuTTY, WSL, Git Bash, etc)

---

## 🚀 COMEÇAR AGORA

### PASSO 1: Conectar ao HostGator

Copie e cole no seu terminal local:

```bash
ssh seu-usuario@seu-servidor-hostgator.com
```

Substitua:
- `seu-usuario` - seu usuário HostGator (ex: fran4942)
- `seu-servidor-hostgator.com` - seu servidor (ex: seu-dominio.com ou IP)

Se pedir senha, use a senha do cPanel.

---

### PASSO 2: Confirmar Acesso

Depois de conectado, copie e cole:

```bash
echo "== WHOAMI =="; whoami
echo "== HOME =="; echo $HOME
echo "== PWD =="; pwd
```

Você deve ver seu usuário e home. Se sim, está conectado!

---

### PASSO 3: Rodar Auditoria Completa (Fases 1-3)

Copie e cole TODO este bloco:

```bash
curl -fsSL https://raw.githubusercontent.com/gabrielfeelix/solar-buy-side-v2/main/run-full-audit-and-deploy.sh -o ~/run-full-audit-and-deploy.sh && sed -i 's/\r$//' ~/run-full-audit-and-deploy.sh && chmod +x ~/run-full-audit-and-deploy.sh && ~/run-full-audit-and-deploy.sh
```

---

## 📊 O Que Vai Acontecer

1. **Fase 1-2: AUDITORIA** (5 minutos)
   - Detecta WEBROOT
   - Verifica Node/NPM
   - Valida repo Git
   - Lista conteúdo do site
   - ❌ **NÃO faz mudanças**

2. **Fase 3: DEPLOY** (5-10 minutos)
   - Clona/atualiza repo
   - Faz npm install
   - Faz npm run build
   - ✅ Backup automático
   - Publica com rsync (seguro)
   - ✅ **Preserva .htaccess e outros**

---

## 📤 Depois: Mande Output

Depois que o script terminar:

1. **Copie TUDO o output** (desde "SOLAR BUY SIDE v2" até o final)
2. **Cole aqui no chat**
3. Claude vai analisar

---

## ⚠️ SE DER ERRO

### Erro: "command not found: curl"

Use wget:

```bash
wget -qO ~/run-full-audit-and-deploy.sh https://raw.githubusercontent.com/gabrielfeelix/solar-buy-side-v2/main/run-full-audit-and-deploy.sh && sed -i 's/\r$//' ~/run-full-audit-and-deploy.sh && chmod +x ~/run-full-audit-and-deploy.sh && ~/run-full-audit-and-deploy.sh
```

### Erro: "Permission denied (publickey)"

SSH key não está configurada. Execute:

```bash
ssh-keygen -t ed25519 -C "seu-email@gmail.com"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
```

Depois vá para GitHub → Settings → SSH Keys → New SSH Key e cole a chave pública.

### Erro: "node: command not found"

Node.js não está instalado. Peça para HostGator instalar via cPanel ou contate suporte.

### Erro: "git: command not found"

Git não está instalado. Contate HostGator suporte.

---

## ✅ Sucesso: Você Vai Ver

```
===============================================
SOLAR BUY SIDE v2 - AUDIT AND DEPLOY
Started: [data/hora]
===============================================

=== PHASE 1: BASIC INFORMATION ===

whoami: seu-usuario
HOME: /home/seu-usuario
PWD: /home/seu-usuario

=== PHASE 2: DOWNLOADING AND RUNNING AUDIT SCRIPT ===

[*] Using curl to download...
[✓] Downloaded successfully

[*] Fixing CRLF line endings...
[*] Setting executable permissions...
[*] Running audit script...

==========================================
[AUDIT OUTPUT HERE - muitas linhas]
==========================================

=== AUDIT COMPLETE ===

>>> COPY THE OUTPUT ABOVE AND SEND TO CLAUDE <<<

Do you want to continue with SAFE DEPLOY? (yes/no):
```

Você vai responder **`yes`** ou **`no`**.

---

## 🎯 PRÓXIMAS FASES

### Se Respondeu "no"

Após revisar o audit:

```bash
bash ~/repos/solar-buy-side-v2/deploy-safe.sh
```

### Se Respondeu "yes"

Script vai fazer tudo automaticamente.

---

## 📞 Precisa de Ajuda?

Se der erro:

1. **Copie a mensagem de erro**
2. **Mande para Claude junto com o output**
3. Claude vai ajudar

---

## 🚀 Vamos Começar?

**Copie este comando e cole no terminal do HostGator:**

```bash
curl -fsSL https://raw.githubusercontent.com/gabrielfeelix/solar-buy-side-v2/main/run-full-audit-and-deploy.sh -o ~/run-full-audit-and-deploy.sh && sed -i 's/\r$//' ~/run-full-audit-and-deploy.sh && chmod +x ~/run-full-audit-and-deploy.sh && ~/run-full-audit-and-deploy.sh
```

**Depois manda o output aqui!** 🎯
