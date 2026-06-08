# 📚 Índice de Documentação - Deploy Automático

## 🎯 Comece por aqui

### Para Setup Inicial
1. **[DEPLOYMENT_QUICK_START.md](DEPLOYMENT_QUICK_START.md)** ← COMECE AQUI
   - Resumo rápido do que fazer
   - TL;DR para quem quer logo sair fazendo

2. **[GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md)**
   - Passo a passo para configurar secrets no GitHub
   - O que você precisa obter do HostGator
   - Como adicionar no GitHub

3. **[FINAL_CHECKLIST.md](FINAL_CHECKLIST.md)**
   - Checklist para validar que tudo está correto
   - 7 fases de verificação
   - Testes de validação

### Para Referência Contínua
- **[COMMANDS_REFERENCE.md](COMMANDS_REFERENCE.md)**
  - Lookup rápido de comandos
  - Cheat sheet para operações comuns
  - Troubleshooting rápido

- **[DEPLOYMENT.md](DEPLOYMENT.md)**
  - Documentação completa e detalhada
  - Explicação de cada passo
  - Troubleshooting extenso
  - Dicas e boas práticas

---

## 📂 Arquivos de Configuração

| Arquivo | Finalidade | Localização |
|---------|-----------|-------------|
| `.github/workflows/deploy.yml` | GitHub Action para deploy automático | GitHub |
| `deploy.sh` | Script de deploy no servidor | HostGator (~/deploy.sh) |
| `.env.example` | Template de variáveis de ambiente | Repositório |
| `.npmrc` | Configuração do npm para produção | Repositório |
| `vite.config.ts` | Configuração do Vite otimizada | Repositório |
| `.gitignore` | Padrões de ignore melhorados | Repositório |

---

## 🛠️ Scripts Úteis

| Script | O Que Faz | Como Usar |
|--------|----------|----------|
| `test-build.sh` | Valida build localmente | `bash test-build.sh` |
| `push-validated.sh` | Push com validação | `bash push-validated.sh` |
| `deploy.sh` | Deploy no servidor | `bash ~/deploy.sh` (servidor) |

---

## 🔄 Fluxo de Workflow

```
Seu PC (Local)
├── npm run dev          (Desenvolvimento)
├── bash test-build.sh   (Validação)
├── bash push-validated.sh (Push)
│
GitHub
├── Webhook recebido
├── npm install
├── npm run build
├── GitHub Action inicia
│
HostGator (Servidor)
├── SSH connection
├── bash ~/deploy.sh
├── git pull
├── npm install
├── npm run build
├── cp dist/* ~/public_html/
│
Seu Domínio
└── Site atualizado! 🎉
```

---

## 📖 Documentos por Tópico

### Setup Inicial
- [DEPLOYMENT_QUICK_START.md](DEPLOYMENT_QUICK_START.md) - Início rápido
- [GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md) - Configurar secrets

### Operações Diárias
- [COMMANDS_REFERENCE.md](COMMANDS_REFERENCE.md) - Comandos rápidos
- [DEPLOYMENT.md](DEPLOYMENT.md) - Guia completo

### Verificação e Testes
- [FINAL_CHECKLIST.md](FINAL_CHECKLIST.md) - Checklist de validação
- [DEPLOYMENT.md](DEPLOYMENT.md) (seção Verificação Pós-Deploy)

### Troubleshooting
- [COMMANDS_REFERENCE.md](COMMANDS_REFERENCE.md) (seção Debugging)
- [DEPLOYMENT.md](DEPLOYMENT.md) (seção Troubleshooting)

### Referência de Configuração
- `vite.config.ts` - Build otimizado
- `.npmrc` - Configuração do npm
- `.env.example` - Variáveis de ambiente
- `.github/workflows/deploy.yml` - GitHub Action

---

## ❓ Perguntas Frequentes

### "Por onde começo?"
→ Vá para [DEPLOYMENT_QUICK_START.md](DEPLOYMENT_QUICK_START.md)

### "Como configuro os secrets?"
→ Vá para [GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md)

### "Preciso validar se tudo está certo"
→ Use [FINAL_CHECKLIST.md](FINAL_CHECKLIST.md)

### "Qual é o comando para...?"
→ Procure em [COMMANDS_REFERENCE.md](COMMANDS_REFERENCE.md)

### "Algo deu errado, como corrijo?"
→ Vá para seção Troubleshooting em [DEPLOYMENT.md](DEPLOYMENT.md)

### "Preciso fazer deploy manual"
→ Vá para seção "Deploy Manual" em [DEPLOYMENT.md](DEPLOYMENT.md)

### "Como faço rollback?"
→ Vá para seção Rollback em [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🎓 Entendendo o Fluxo

### O que é cada componente?

1. **GitHub Actions** (`.github/workflows/deploy.yml`)
   - Executa quando você faz push
   - Valida o build
   - Conecta ao HostGator via SSH
   - Inicia o deploy automático

2. **Deploy Script** (`deploy.sh`)
   - Executado no servidor
   - Faz git pull
   - Instala dependências
   - Faz build
   - Copia para pasta pública
   - Cria backups e rollback automático

3. **GitHub Secrets**
   - Credenciais criptografadas
   - Usadas pelo GitHub Action
   - Nunca expostas em logs

4. **Vite Config** (`vite.config.ts`)
   - Otimizações de build
   - Minificação automática
   - Code splitting

---

## 🚀 Quick Start (Resumido)

### 1. Setup no HostGator (uma vez)
```bash
# Clonar e preparar
mkdir -p ~/repos ~/public_html
cd ~/repos
git clone git@github.com:gabrielfeelix/solar-buy-side-v2.git
chmod +x ~/repos/solar-buy-side-v2/deploy.sh

# Testar
bash ~/repos/solar-buy-side-v2/deploy.sh
```

### 2. Configurar Secrets no GitHub (uma vez)
- `HOSTGATOR_HOST` - host do servidor
- `HOSTGATOR_USER` - usuário SSH
- `HOSTGATOR_SSH_KEY` - chave privada
- `HOSTGATOR_SSH_PORT` - porta (opcional)

### 3. Usar Diariamente
```bash
# Seu PC
bash test-build.sh      # Valida
bash push-validated.sh  # Faz push
# Pronto! Deploy automático ✨
```

---

## 📞 Suporte e Contato

### Problemas Comuns
- **Build falha**: Veja `npm run lint` e `npm run build`
- **SSH falha**: Verifique secrets no GitHub
- **Site não atualiza**: Aguarde 2-5 min, limpe cache do navegador
- **GitHub Action error**: Veja logs em GitHub → Actions

### Checklist de Debug
1. ✅ Rode `bash test-build.sh` localmente
2. ✅ Verifique secrets no GitHub
3. ✅ Veja logs do GitHub Action
4. ✅ SSH manual para servidor e rode `bash ~/deploy.sh`
5. ✅ Veja `~/deploy-logs/latest.log` no servidor

---

## 📊 Estrutura de Arquivos

```
solar-buy-side-v2/
├── .github/
│   └── workflows/
│       └── deploy.yml              ← GitHub Action
├── src/                            ← Código fonte
├── dist/                           ← Build gerado
├── deploy.sh                       ← Script deploy
├── test-build.sh                   ← Validar build
├── push-validated.sh               ← Push com validação
├── vite.config.ts                  ← Configuração Vite
├── .npmrc                          ← Configuração npm
├── .env.example                    ← Template .env
├── .gitignore                      ← Git ignore
├── DEPLOYMENT.md                   ← Guia completo
├── DEPLOYMENT_QUICK_START.md       ← Início rápido
├── GITHUB_SECRETS_SETUP.md         ← Configurar secrets
├── FINAL_CHECKLIST.md              ← Checklist
├── COMMANDS_REFERENCE.md           ← Comandos rápidos
└── DOCS_INDEX.md                   ← Este arquivo
```

---

## 📈 Progresso

- [x] Setup SSH no HostGator
- [x] Deploy script criado
- [x] GitHub Action configurada
- [x] Documentação completa
- [x] Scripts de validação
- [x] Checklist final
- [ ] Você: Configurar secrets (próximo passo!)
- [ ] Você: Testar deploy automático
- [ ] Você: Usar no dia a dia ✨

---

## 🎯 Próximos Passos

1. **Leia** [DEPLOYMENT_QUICK_START.md](DEPLOYMENT_QUICK_START.md)
2. **Configure** secrets no GitHub seguindo [GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md)
3. **Valide** usando [FINAL_CHECKLIST.md](FINAL_CHECKLIST.md)
4. **Use** [COMMANDS_REFERENCE.md](COMMANDS_REFERENCE.md) como referência diária

---

**Tudo pronto! Vá para [DEPLOYMENT_QUICK_START.md](DEPLOYMENT_QUICK_START.md) para começar! 🚀**

---

**Última atualização**: 2026-02-01
**Mantido por**: Claude Haiku 4.5
