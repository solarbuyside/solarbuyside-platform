# Checklist Final - Deploy Automático

Use este checklist para garantir que tudo está configurado corretamente.

## ✅ Fase 1: Setup Local (Seu PC)

- [ ] SSH key criada com `ssh-keygen -t ed25519`
- [ ] Chave pública adicionada no GitHub (Settings → SSH and GPG keys)
- [ ] Testado com `ssh -T git@github.com` → "successfully authenticated"
- [ ] Repositório clonado e acessível: `git clone git@github.com:gabrielfeelix/solar-buy-side-v2.git`
- [ ] Node.js e npm instalados localmente
- [ ] npm install executado sem erros
- [ ] npm run build testado localmente e gerou pasta dist/
- [ ] Linter passou: `npm run lint`

## ✅ Fase 2: Setup HostGator (Servidor)

- [ ] SSH key criada no HostGator: `ssh-keygen -t ed25519 -C "seu-email"`
- [ ] SSH agent iniciado: `eval "$(ssh-agent -s)"`
- [ ] Chave adicionada ao agent: `ssh-add ~/.ssh/id_rsa` (ou id_ed25519)
- [ ] Pasta repos criada: `mkdir -p ~/repos`
- [ ] Pasta public_html criada: `mkdir -p ~/public_html`
- [ ] Repositório clonado no servidor:
  ```bash
  cd ~/repos
  git clone git@github.com:gabrielfeelix/solar-buy-side-v2.git
  ```
- [ ] Clonagem verificada: `ls -la ~/repos/solar-buy-side-v2/` → vê package.json, src/, etc
- [ ] Permissão do script: `chmod +x ~/repos/solar-buy-side-v2/deploy.sh`
- [ ] Node.js/npm instalado no servidor
- [ ] Teste rápido: `cd ~/repos/solar-buy-side-v2 && npm install` sem erros

## ✅ Fase 3: GitHub Secrets

Accesse: **Repository Settings → Secrets and variables → Actions**

- [ ] Secret criado: `HOSTGATOR_HOST` → (host/IP do servidor)
- [ ] Secret criado: `HOSTGATOR_USER` → (usuário SSH, ex: fran4942)
- [ ] Secret criado: `HOSTGATOR_SSH_KEY` → (chave privada completa id_rsa)
- [ ] Secret criado (opcional): `HOSTGATOR_SSH_PORT` → (22 se padrão)

Validação dos secrets:
- [ ] Todos aparecem com ● (mascarados) na página de secrets
- [ ] Nenhum secret contém erros de formatação

## ✅ Fase 4: Verificação de Arquivos

No repositório principal verificar que existem:

- [ ] `.github/workflows/deploy.yml` → GitHub Action criada
- [ ] `deploy.sh` → Script de deploy no servidor
- [ ] `.env.example` → Template de variáveis (não commitado: .env)
- [ ] `.npmrc` → Configurações de npm
- [ ] `DEPLOYMENT.md` → Documentação
- [ ] `GITHUB_SECRETS_SETUP.md` → Guia de secrets
- [ ] `vite.config.ts` → Configuração otimizada
- [ ] `.gitignore` → Atualizado com padrões adicionais

## ✅ Fase 5: Teste do Deploy Automático

### 5.1 - Verificação Manual do Servidor

No HostGator, execute manualmente:
```bash
bash ~/deploy.sh
```

Resultados esperados:
- [ ] Script começa e mostra "[INFO] Iniciando deploy..."
- [ ] Git pull bem-sucedido
- [ ] npm install bem-sucedido
- [ ] npm run build bem-sucedido
- [ ] Backup criado
- [ ] Arquivos copiados para ~/public_html
- [ ] Script termina com "✓ Deploy concluído com sucesso!"

Verificação pós-deploy:
- [ ] `ls -la ~/public_html` → contém index.html e assets/
- [ ] `du -sh ~/public_html` → mostra tamanho (> 100KB)
- [ ] Site acessível em https://seu-dominio.com

### 5.2 - Teste via GitHub Actions

1. Faça uma pequena mudança no repositório:
   ```bash
   git add .
   git commit -m "test: verificar deploy automático"
   git push origin main
   ```

2. Verifique GitHub Actions:
   - [ ] Acesse: https://github.com/gabrielfeelix/solar-buy-side-v2/actions
   - [ ] Veja o workflow em execução
   - [ ] Espere até concluir
   - [ ] Resultado final: ✅ (verde)

3. Verifique os logs no Actions:
   - [ ] Build passou ✅
   - [ ] Linter passou (ou aviso aceitável)
   - [ ] SSH connection bem-sucedida
   - [ ] Deploy script executado
   - [ ] Mensagem final: "✓ Deploy concluído com sucesso!"

4. Verifique se a mudança foi refletida:
   - [ ] Atualize https://seu-dominio.com
   - [ ] Limpe cache do navegador (Ctrl+Shift+Del)
   - [ ] Veja a mudança refletida no site

## ✅ Fase 6: Testes Adicionais

### 6.1 - Teste de Build Local

Execute antes de cada commit:
```bash
bash test-build.sh
```

- [ ] Script executa sem erros
- [ ] Linter passa
- [ ] Build gerado
- [ ] dist/ criada
- [ ] index.html presente

### 6.2 - Teste de Rollback

Se necessário:
```bash
# Ver backups
ls -la ~/backup_before_deploy_*

# Restaurar se necessário
cp -r ~/backup_before_deploy_LATEST/* ~/public_html/
```

- [ ] Backups existem com timestamp
- [ ] Rollback funciona restaurando versão anterior

### 6.3 - Monitoração

- [ ] Verificar logs periódicos: `tail ~/deploy-logs/latest.log`
- [ ] Site carrega sem erros (F12 → Console)
- [ ] Performance OK (Lighthouse)

## ✅ Fase 7: Documentação e Referência

- [ ] Leu `DEPLOYMENT.md` completamente
- [ ] Entendeu o fluxo do `deploy.sh`
- [ ] Sabe onde os secrets estão no GitHub
- [ ] Conhece como fazer rollback
- [ ] Tem os dados para troubleshooting

## 🚀 Pronto para Usar!

Se todos os itens acima estão marcados, seu setup está **100% funcional**!

### Workflow Diário

1. Faça mudanças no código localmente
2. Teste com `bash test-build.sh`
3. Commit e push: `git push origin main`
4. GitHub Action dispara automaticamente
5. Deploy acontece no HostGator
6. Site atualiza automaticamente ✨

### Referência Rápida

| Ação | Comando |
|------|---------|
| Teste local | `bash test-build.sh` |
| Deploy manual | `bash ~/deploy.sh` (no servidor) |
| Ver logs | `tail ~/deploy-logs/latest.log` |
| Ver GitHub Actions | https://github.com/gabrielfeelix/solar-buy-side-v2/actions |
| Acessar site | https://seu-dominio.com |

---

**Problemas?** Veja `DEPLOYMENT.md` seção de Troubleshooting

**Última atualização**: 2026-02-01
