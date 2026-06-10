# ✅ Checklist de Verificação - Deploy Frontend

## 🔍 Problema Atual

**Erro no navegador:**
```
Failed to load module script: Expected a JavaScript module but got text/html
```

**Causa:** Os arquivos JS não estão no servidor ou estão no lugar errado.

---

## 📋 Arquivos que DEVEM estar no servidor

### No diretório raiz (`public_html/`):
```
✅ index.html
✅ favicon.png
✅ .htaccess
```

### Na pasta `assets/` (`public_html/assets/`):
```
✅ index-CYk6jFlr.js      (352 KB)
✅ index-DeNow2fS.css     (68 KB)
✅ lucide-CUuekn2S.js     (23 KB)
✅ react-VsOGq5IF.js      (4 KB)
✅ Todas as imagens (.png, .jpg, .svg, .webp)
```

---

## 🧪 Como verificar no servidor

### Via SSH:
```bash
ssh seu-usuario@solarbuyside.com.br

# Verificar se os arquivos existem
ls -la ~/public_html/
ls -la ~/public_html/assets/

# Procurar o arquivo JS específico
find ~/public_html -name "index-CYk6jFlr.js"

# Ver tamanho do arquivo
ls -lh ~/public_html/assets/index-CYk6jFlr.js
```

### Via cPanel File Manager:
1. Acesse cPanel → File Manager
2. Vá para `public_html/`
3. Verifique se existe pasta `assets/`
4. Entre em `assets/` e veja se tem os arquivos `.js` e `.css`

---

## 🔧 Solução: Copiar arquivos corretamente

### Opção 1: Via SSH (RECOMENDADO)

```bash
# 1. Conectar
ssh seu-usuario@solarbuyside.com.br

# 2. Ir para o repo
cd ~/repos/solar-buy-side-v2

# 3. Pull das últimas mudanças
git pull origin main

# 4. Build
npm run build

# 5. Backup do public_html
cd ~/public_html
mkdir -p ../backups
tar -czf ../backups/backup-$(date +%Y%m%d-%H%M%S).tar.gz .

# 6. Copiar TUDO do dist (incluindo assets/)
cp -r ~/repos/solar-buy-side-v2/dist/* ~/public_html/

# 7. Verificar se copiou
ls -la ~/public_html/
ls -la ~/public_html/assets/

# 8. Verificar .htaccess
cat ~/public_html/.htaccess
```

### Opção 2: Upload manual via FTP

1. Baixe a pasta `dist/` completa do repositório local
2. Faça upload via FileZilla/cPanel para `public_html/`
3. Certifique-se que a estrutura fica:
   ```
   public_html/
   ├── index.html
   ├── favicon.png
   ├── .htaccess
   └── assets/
       ├── index-CYk6jFlr.js
       ├── index-DeNow2fS.css
       ├── lucide-CUuekn2S.js
       ├── react-VsOGq5IF.js
       └── (imagens)
   ```

---

## ⚠️ IMPORTANTE: .htaccess

O arquivo `.htaccess` DEVE estar em `public_html/.htaccess` com este conteúdo:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Proxy para API - redireciona /api/* para o backend Node.js
  RewriteCond %{REQUEST_URI} ^/api/
  RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]

  # SPA Routing - redireciona todas as rotas para index.html
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_URI} !^/api/
  RewriteRule . /index.html [L]
</IfModule>
```

**A linha `RewriteCond %{REQUEST_FILENAME} !-f` é CRUCIAL** - ela impede que arquivos que existem (como os .js) sejam redirecionados.

---

## 🧪 Testar após deploy

1. **Abra:** https://solarbuyside.com.br
2. **Pressione:** `Ctrl + Shift + R` (limpar cache)
3. **Abra DevTools:** F12 → Console
4. **Verifique:** Não deve ter erros de "Failed to load module script"

Se ainda tiver erro:
- **Teste o arquivo diretamente:** https://solarbuyside.com.br/assets/index-CYk6jFlr.js
- **Deve mostrar:** Código JavaScript
- **Se mostrar HTML:** Os arquivos não foram copiados corretamente

---

## 🚨 Problemas comuns

### 1. "Assets não copiados"
**Sintoma:** Erro "Failed to load module script"
**Causa:** Comando `cp` não copiou a pasta assets/
**Solução:** Use `cp -r` (recursivo) para copiar subpastas

### 2. "Permissões incorretas"
**Sintoma:** 403 Forbidden nos arquivos JS
**Causa:** Arquivos sem permissão de leitura
**Solução:**
```bash
chmod 644 ~/public_html/assets/*.js
chmod 644 ~/public_html/assets/*.css
```

### 3. ".htaccess não funciona"
**Sintoma:** Arquivos JS retornam HTML
**Causa:** .htaccess desabilitado ou incorreto
**Solução:** Verificar se AllowOverride está ativado no servidor

---

## 📞 Se nada funcionar

Me envie o output de:
```bash
ls -la ~/public_html/
ls -la ~/public_html/assets/
cat ~/public_html/.htaccess
curl -I https://solarbuyside.com.br/assets/index-CYk6jFlr.js
```
