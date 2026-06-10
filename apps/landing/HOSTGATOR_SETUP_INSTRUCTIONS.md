# HostGator Setup Instructions

## 🎯 Objetivo

Realizar auditoria completa do setup de deployment no HostGator, corrigir problemas e deixar tudo pronto para GitHub Actions automático.

---

## 📋 Passo 1: Rodar Auditoria (OBRIGATÓRIO)

**Você precisa:**
1. Acessar HostGator via SSH ou cPanel Terminal
2. Fazer download ou copiar o script `hostgator-audit.sh` do repositório
3. Executar o script
4. **Mandar o output completo para Claude**

### Como acessar HostGator via SSH

```bash
# No seu terminal local:
ssh seu-usuario@seu-servidor-hostgator.com
# ou
ssh seu-usuario@seu-dominio.com
```

Se não souber a senha, use a senha do cPanel.

### Fazer download e rodar audit

```bash
# No servidor HostGator (após SSH):

# Opção A: Se o repo já está clonado
cd ~/repos/solar-buy-side-v2
bash hostgator-audit.sh > audit-report.txt 2>&1
cat audit-report.txt

# Opção B: Se o repo NÃO está clonado, baixar o script diretamente
curl -fsSL https://raw.githubusercontent.com/gabrielfeelix/solar-buy-side-v2/main/hostgator-audit.sh -o ~/hostgator-audit.sh
chmod +x ~/hostgator-audit.sh
~/hostgator-audit.sh
```

### Copiar output para você

```bash
# Se salvou em arquivo
cat ~/audit-report.txt

# Se rodou direto, copie/cole o output todo
```

**⚠️ IMPORTANTE:** Mande TODO o output do audit para Claude. Isso vai determinar os próximos passos.

---

## 📋 Passo 2: Depois que o Audit Passar

Após Claude analisar o audit, você vai executar:

### 2A: Garantir que o repo está atualizado

```bash
mkdir -p ~/repos
cd ~/repos

# Se não tiver repo
if [ ! -d "solar-buy-side-v2/.git" ]; then
  git clone git@github.com:gabrielfeelix/solar-buy-side-v2.git
fi

# Atualizar repo
cd solar-buy-side-v2
git pull
```

### 2B: Normalizar line endings (corrigir CRLF)

```bash
cd ~/repos/solar-buy-side-v2
sed -i 's/\r$//' deploy.sh 2>/dev/null || true
sed -i 's/\r$//' deploy-safe.sh 2>/dev/null || true
chmod +x deploy.sh deploy-safe.sh
```

### 2C: Rodar deploy seguro

```bash
# Opção segura (recomendada)
bash ~/repos/solar-buy-side-v2/deploy-safe.sh

# Ou o deploy original (se preferir)
bash ~/repos/solar-buy-side-v2/deploy.sh
```

---

## 🔍 O que o Audit Verifica

### Informações Básicas
- ✅ Usuário SSH
- ✅ Home directory
- ✅ Estrutura de diretórios

### Detecção de WEBROOT
- ✅ Existe `~/public_html`?
- ✅ Existe `~/domains/*/public_html`?
- ✅ Qual é o correto?

### Conteúdo do WEBROOT
- ✅ Arquivos e pastas
- ✅ Arquivos importantes (.htaccess, robots.txt, sitemap.xml)
- ✅ Tamanho total

### Node.js e NPM
- ✅ Versão instalada
- ✅ Se está disponível no PATH

### Repositório Git
- ✅ Se existe
- ✅ Branch atual
- ✅ Remote URL

### Deploy Script
- ✅ Se existe
- ✅ Encoding (CRLF vs LF)
- ✅ Permissões
- ✅ Conteúdo

---

## 🚨 Possíveis Problemas e Soluções

### "Permission denied (publickey)"

SSH key não configurada no GitHub.

**Solução:**
```bash
ssh-keygen -t ed25519 -C "seu-email@gmail.com"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
# Copie a chave pública para GitHub → Settings → SSH Keys
```

### "No Node/NPM"

Node.js não instalado no servidor.

**Solução:**
Peça para HostGator instalar via cPanel → Software → Node.js
Ou contate suporte.

### "WEBROOT not found"

Deploy precisa saber onde publicar.

**Solução:**
- Crie `~/public_html` manualmente: `mkdir -p ~/public_html`
- Ou configure o domínio apontando para o path correto

### "CRLF line terminators"

Scripts .sh têm quebras de linha Windows.

**Solução:**
```bash
sed -i 's/\r$//' ~/repos/solar-buy-side-v2/deploy.sh
sed -i 's/\r$//' ~/repos/solar-buy-side-v2/deploy-safe.sh
```

### "Build fails with missing packages"

Dependências não instaladas.

**Solução:**
```bash
cd ~/repos/solar-buy-side-v2
npm ci  # Ou npm install
```

---

## 📊 Output Esperado do Audit

Se tudo está ok, você deve ver:

```
===============================================
HOSTGATOR DEPLOYMENT AUDIT
Generated: ...
===============================================

=== PART A: BASIC INFORMATION ===

[A1] User and Home
----
whoami: seu-usuario
HOME: /home/seu-usuario

[A2] Home Directory Structure
----
total ...
drwxr-xr-x ...
...

[A3] Check for public_html
----
✓ ~/public_html EXISTS

[A4] Check for domains structure
----
✓ ~/domains EXISTS

[A5] Auto-detecting WEBROOT
----
DETECTED WEBROOT: /home/seu-usuario/public_html

[A6] WEBROOT Contents
----
index.html  ... (arquivos atuais ou vazio)

=== PART B: NODE/NPM VERSIONS ===
----
node: v18.x.x
npm: 9.x.x

=== PART C: REPOSITORY STATUS ===
----
✓ Repository EXISTS

Branch: main
Remote: origin  git@github.com:gabrielfeelix/solar-buy-side-v2.git

=== PART D: PACKAGE.JSON ===
----
✓ package.json found
{...}

=== PART E: DEPLOY.SH STATUS ===
----
✓ deploy.sh exists
File type: ... ASCII text with line endings

=== PART F: DISK SPACE ===
----
Home directory usage: ...
public_html usage: ...

=== PART G: SYSTEM INFO ===
----
OS: Linux
...

===============================================
END OF AUDIT REPORT
===============================================
```

---

## ✅ Próximos Passos

1. **Rodou audit?** → Manda output para Claude
2. **Claude analisou?** → Execute os passos que Claude indicar
3. **Deploy funcionou?** → Configure GitHub Secrets
4. **Pronto!** → GitHub Actions vai fazer deploy automático

---

## 🔐 Segurança

⚠️ **IMPORTANTE:**

- ❌ Não compartilhe chaves SSH privadas
- ❌ Não coloque secrets em chat
- ✅ Use GitHub UI para configurar secrets
- ✅ Use SSH keys via GitHub UI
- ✅ Mantenha backups automáticos

---

## 📞 Precisa de Ajuda?

Se algo falhar:

1. Veja o erro específico no output do audit
2. Procure a seção "Possíveis Problemas" acima
3. Execute a solução
4. Rode audit novamente
5. Se ainda falhar, mande o output para Claude

---

## Script de Uma Linha (copiar/colar)

Se quiser fazer tudo de uma vez:

```bash
ssh seu-usuario@seu-servidor.com 'mkdir -p ~/repos && cd ~/repos && (git clone git@github.com:gabrielfeelix/solar-buy-side-v2.git 2>/dev/null || cd solar-buy-side-v2 && git pull) && bash ~/repos/solar-buy-side-v2/hostgator-audit.sh'
```

---

**Está pronto?** Rode o audit e mande o output! 🚀
