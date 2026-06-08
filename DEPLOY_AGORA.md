# 🚀 DEPLOY IMEDIATO - Solar Buy-Side

## ✅ Status Atual
- ✅ Build gerado com sucesso
- ✅ Código commitado e enviado para GitHub
- ✅ Arquivos em `hostgator-dist/` atualizados
- ⏳ Aguardando deploy no servidor

---

## 🎯 OPÇÃO 1: Deploy Automático via SSH (RECOMENDADO)

### 1️⃣ Conectar ao servidor HostGator

Abra seu terminal SSH (PuTTY, WSL, Git Bash) e execute:

```bash
ssh seu-usuario@solarbuyside.com.br
```

### 2️⃣ Rodar script de deploy automático

Depois de conectado, copie e cole este comando:

```bash
curl -fsSL https://raw.githubusercontent.com/gabrielfeelix/solar-buy-side-v2/main/run-full-audit-and-deploy.sh -o ~/run-full-audit-and-deploy.sh && sed -i 's/\r$//' ~/run-full-audit-and-deploy.sh && chmod +x ~/run-full-audit-and-deploy.sh && ~/run-full-audit-and-deploy.sh
```

**O que o script faz:**
- Atualiza o repositório Git no servidor
- Executa `npm install` e `npm run build`
- Cria backup automático do site atual
- Faz deploy dos novos arquivos para `public_html/`

---

## 🎯 OPÇÃO 2: Deploy Manual via FTP

### 1️⃣ Conectar via FTP

Use seu cliente FTP preferido (FileZilla, WinSCP, etc):
- **Host:** ftp.solarbuyside.com.br
- **Usuário:** seu-usuario-ftp
- **Senha:** sua-senha-ftp
- **Porta:** 21

### 2️⃣ Fazer backup

Antes de substituir, faça backup da pasta `public_html/`

### 3️⃣ Enviar arquivos

1. Navegue até `public_html/` no servidor
2. Selecione TODOS os arquivos de `d:\solar-buy-side-v2\hostgator-dist\`
3. Faça upload (substituir arquivos existentes)

**Arquivos críticos:**
- ✅ `index.html`
- ✅ `.htaccess`
- ✅ Pasta `assets/` completa
- ✅ Todos os favicons

---

## 🎯 OPÇÃO 3: Deploy via cPanel

### 1️⃣ Acessar cPanel
https://solarbuyside.com.br:2083

### 2️⃣ File Manager
1. Abra o "Gerenciador de Arquivos"
2. Navegue até `public_html/`
3. Faça backup dos arquivos atuais
4. Delete arquivos antigos
5. Faça upload de `hostgator-dist/*`

---

## 📋 Verificar Deploy

Após o deploy, acesse:
- ✅ https://solarbuyside.com.br
- ✅ Pressione Ctrl + Shift + R (hard refresh)
- ✅ Verifique se as alterações estão visíveis

### Alterações desta versão:
1. ✅ FAQ com scroll e textos justificados
2. ✅ Seção depoimentos: "As vozes de quem aprendeu"
3. ✅ Badge "COMPRADOR" nos depoimentos
4. ✅ Card "Domine a Venda" na seção Manual
5. ✅ Descrição "Postura consultiva" atualizada

---

## ⚠️ Problemas?

Se o site não atualizar:
1. Limpe cache do navegador (Ctrl + Shift + Delete)
2. Teste em aba anônima
3. Verifique se `.htaccess` foi enviado
4. Verifique se os arquivos JS/CSS da pasta `assets/` foram atualizados

---

## 📊 Últimos Commits

```
534757e - Ajustar cards da seção Manual Buy-Side
5a4f61b - Atualizar seção de depoimentos dos compradores
d425ff6 - Corrigir FAQ: adicionar scroll e justificar respostas
9eccb9c - Ajustar CTAs e corrigir frame do vídeo Wistia
c2ec35a - Melhorias visuais e ajustes de UX na landing page
```

---

🎉 **Pronto para produção!**
