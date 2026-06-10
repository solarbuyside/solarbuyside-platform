# 🚀 DEPLOY - Instruções Rápidas

## ✅ Situação Atual
- Build atualizado em `hostgator-dist/`
- Código commitado no GitHub (commit 534757e)
- Pronto para deploy em produção

---

## 🎯 OPÇÃO 1: Deploy Automático via SSH (MAIS RÁPIDO)

### Abra seu terminal SSH e execute:

```bash
ssh seu-usuario@solarbuyside.com.br
```

Após conectado, execute o comando one-liner:

```bash
curl -fsSL https://raw.githubusercontent.com/gabrielfeelix/solar-buy-side-v2/main/run-full-audit-and-deploy.sh | bash
```

**Isso vai:**
1. Baixar o repositório atualizado
2. Fazer build no servidor
3. Criar backup automático
4. Fazer deploy em `public_html/`

---

## 🎯 OPÇÃO 2: Deploy via FTP/FileZilla (MANUAL)

### 1. Abra FileZilla e conecte:
- **Host:** ftp.solarbuyside.com.br
- **Usuário:** seu-usuario-ftp
- **Senha:** sua-senha-ftp
- **Porta:** 21

### 2. Navegue no servidor:
- Vá para a pasta `public_html/`

### 3. Faça backup:
- Baixe a pasta `public_html/` atual para seu computador (backup)

### 4. Envie os arquivos:
- Selecione TODOS os arquivos de `D:\solar-buy-side-v2\hostgator-dist\`
- Arraste para `public_html/` no servidor
- Escolha "Sobrescrever" quando perguntado

**Arquivos essenciais a enviar:**
- `index.html`
- `.htaccess`
- Pasta `assets/` completa
- Todos os favicons (`.ico`, `.png`, `.svg`)

---

## 🎯 OPÇÃO 3: Deploy via WinSCP (SEMI-AUTOMÁTICO)

### 1. Baixe e instale WinSCP:
https://winscp.net/download/WinSCP-6.3.5-Setup.exe

### 2. Configure o script PowerShell:
Edite o arquivo `deploy-ftp.ps1` e preencha:
```powershell
$FTP_USER = "seu-usuario-aqui"
$FTP_PASS = "sua-senha-aqui"
```

### 3. Execute:
```powershell
.\deploy-ftp.ps1
```

---

## 📋 Verificar Deploy

Após qualquer método, acesse:
- https://solarbuyside.com.br
- Pressione `Ctrl + Shift + R` (hard refresh)

### Conferir alterações desta versão:
1. ✅ Seção "Manual Strategic":
   - Card "Domine a Venda"
   - Descrição "Postura consultiva" atualizada
2. ✅ Seção "As vozes de quem aprendeu"
3. ✅ Badges "COMPRADOR" nos depoimentos
4. ✅ FAQ com scroll
5. ✅ Todos os textos justificados

---

## ⚡ Método Mais Rápido (RECOMENDADO)

Se você tem acesso SSH, use:

```bash
ssh usuario@solarbuyside.com.br "cd ~/repos/solar-buy-side-v2 && git pull && npm install && npm run build && rsync -av --delete dist/ ~/public_html/"
```

Este comando único faz tudo: atualiza repo, instala dependências, faz build e deploy.

---

## ❓ Problemas?

### Site não atualizou:
1. Limpe cache: `Ctrl + Shift + Delete`
2. Teste em aba anônima
3. Verifique se `.htaccess` foi enviado

### Erro no SSH:
```bash
# Verifique se está no diretório certo
cd ~/repos/solar-buy-side-v2
pwd

# Force pull
git fetch --all
git reset --hard origin/main
```

### Erro no FTP:
- Verifique credenciais
- Use modo Passivo se der timeout
- Verifique permissões da pasta

---

**🎉 Depois do deploy, confirme que o site está atualizado acessando a URL!**
