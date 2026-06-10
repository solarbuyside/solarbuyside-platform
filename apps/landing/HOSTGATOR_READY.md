# HostGator Deployment - Ready to Execute

## 🎯 Status Atual

✅ Todos os scripts e documentação foram criados e commitados
✅ Repo pronto em GitHub
⏳ Aguardando execução no HostGator

---

## 🚀 Próximos Passos (Para Você)

### PASSO 1: Rodar Auditoria (5 minutos)

Você vai executar um único script no HostGator que coleta todas as informações necessárias.

**No seu PC:**
1. Acesse HostGator via SSH:
   ```bash
   ssh seu-usuario@seu-servidor-hostgator.com
   ```

**No servidor HostGator (via SSH ou cPanel Terminal):**

```bash
# Fazer download e rodar auditoria
curl -fsSL https://raw.githubusercontent.com/gabrielfeelix/solar-buy-side-v2/main/hostgator-audit.sh -o ~/hostgator-audit.sh
chmod +x ~/hostgator-audit.sh
~/hostgator-audit.sh
```

**Copie TODO o output** e **mande para Claude** (cole aqui no chat).

---

## 📋 O que o Script Faz

O `hostgator-audit.sh` fará:

1. **Detectar WEBROOT** (onde o site é publicado)
   - Tenta `~/public_html`
   - Se não existir, tenta `~/domains/*/public_html`

2. **Verificar Node/NPM** (necessário para build)
   - Confirma versões instaladas

3. **Validar repositório Git** (se já foi clonado)
   - Branch atual
   - URL remota

4. **Validar scripts de deploy**
   - Encoding (CRLF vs LF)
   - Conteúdo

5. **Listar conteúdo do WEBROOT**
   - Arquivos existentes
   - Tamanho total

6. **Coletar informações do sistema**
   - OS, uptime, etc

**Tudo isso sem fazer NENHUMA mudança no servidor.**

---

## ⏭️ PASSO 2: Depois do Audit (Claude vai instruir)

Após você mandar o output, Claude vai:

1. **Analisar o relatório**
2. **Identificar possíveis problemas**
3. **Instruir próximas ações específicas**

Exemplos de ações possíveis:
- Corrigir CRLF em scripts
- Garantir que Node/NPM está instalado
- Clonar o repositório
- Rodar o deploy-safe.sh

---

## 📊 Scripts Disponíveis no Servidor

Após clonar o repo, você terá:

### `deploy-safe.sh` ⭐ (RECOMENDADO)

Script robusto com:
- ✅ Auto-detecção de WEBROOT
- ✅ Backup automático com timestamp
- ✅ Usa `rsync` em vez de `rm -rf`
- ✅ Preserva `.htaccess`
- ✅ Rollback automático em erro
- ✅ Logs coloridos

```bash
bash ~/repos/solar-buy-side-v2/deploy-safe.sh
```

### `deploy.sh` (original)

Versão anterior, ainda funciona:

```bash
bash ~/repos/solar-buy-side-v2/deploy.sh
```

---

## 🔒 Segurança

### ✅ O que foi feito

- Scripts usam `rsync` em vez de `rm -rf` (seguro)
- Backup automático antes de qualquer mudança
- Rollback automático em caso de erro
- Não há chaves secretas nos scripts

### ❌ Nunca faça

- Não compartilhe chaves SSH privadas
- Não coloque secrets no repositório
- Não faça `rm -rf ~/public_html/*` manualmente

### ✅ Sempre

- Mantenha backups
- Teste deploy em staging se possível
- Use GitHub Secrets para credenciais

---

## 📁 Estrutura no Servidor

Após execução:

```
~/
├── repos/
│   └── solar-buy-side-v2/          ← Repositório clonado
│       ├── src/
│       ├── dist/                   ← Gerado por npm run build
│       ├── package.json
│       ├── deploy.sh               ← Script original
│       ├── deploy-safe.sh          ← Script seguro
│       ├── hostgator-audit.sh      ← Script de auditoria
│       └── ...
├── public_html/                    ← WEBROOT (site publicado)
│   ├── index.html
│   ├── assets/
│   └── ...
└── backup_public_html/             ← Backups automáticos
    ├── backup_20260201_120000/
    ├── backup_20260201_130000/
    └── ...
```

---

## 🎯 Fluxo Completo

```
Passo 1: Rodar audit
    ↓ (manda output para Claude)
    ↓
Passo 2: Claude analisa e instrui
    ↓
Passo 3: Garantir node/npm/git
    ↓
Passo 4: Clonar/atualizar repo
    ↓
Passo 5: Rodar bash deploy-safe.sh
    ↓
Passo 6: Validar site em domínio
    ↓
Passo 7: Configurar GitHub Secrets
    ↓
Passo 8: GitHub Actions faz deploy automático
```

---

## 🚨 Troubleshooting Rápido

### "Cannot find audit script"
```bash
# Rodou do lugar certo?
ls ~/hostgator-audit.sh

# Se não existir, baixar novamente
curl -fsSL https://raw.githubusercontent.com/gabrielfeelix/solar-buy-side-v2/main/hostgator-audit.sh -o ~/hostgator-audit.sh
chmod +x ~/hostgator-audit.sh
```

### "Permission denied"
```bash
# Dar permissão de execução
chmod +x ~/hostgator-audit.sh
chmod +x ~/repos/solar-buy-side-v2/deploy-safe.sh
chmod +x ~/repos/solar-buy-side-v2/deploy.sh
```

### "SSH key not configured"
```bash
# Gerar chave se não tiver
ssh-keygen -t ed25519 -C "seu-email@gmail.com"

# Testar com GitHub
ssh -T git@github.com
```

---

## 📞 Próximos Passos

1. ✅ Leu este arquivo
2. ⏳ **Execute o script de auditoria**
3. ⏳ **Mande output para Claude**
4. ⏳ Claude vai instruir próximas ações

---

## 📝 Checklist Antes de Começar

- [ ] Você tem acesso SSH ao HostGator
- [ ] Sabe seu usuário SSH (ex: fran4942)
- [ ] Sabe o servidor/host do HostGator
- [ ] Pode colar comandos em um terminal SSH
- [ ] Pronto para copiar/colar o output aqui no chat

---

## 🎬 Começar Agora

**No seu PC, abra terminal e rode:**

```bash
ssh seu-usuario@seu-servidor-hostgator.com
```

**Depois no servidor:**

```bash
curl -fsSL https://raw.githubusercontent.com/gabrielfeelix/solar-buy-side-v2/main/hostgator-audit.sh -o ~/hostgator-audit.sh
chmod +x ~/hostgator-audit.sh
~/hostgator-audit.sh
```

**Depois copie TODO o output acima e mande aqui!**

---

**Status:** Pronto para Auditoria 🚀
**Tempo estimado:** 5-10 minutos
**Dificuldade:** Baixa (apenas copiar/colar comandos)

