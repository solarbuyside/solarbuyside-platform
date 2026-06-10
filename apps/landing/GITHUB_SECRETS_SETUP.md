# Configuração de GitHub Secrets para Deploy Automático

## 📋 O que você precisa fazer

Este documento descreve como configurar os secrets necessários para o deploy automático funcionar.

## Passo 1: Obter as informações do HostGator

### 1.1 - Host do servidor
```bash
# Execute no seu terminal/SSH
echo $HOSTNAME
# ou
hostname
```
Anote o resultado ou use o IP do servidor

### 1.2 - Usuário SSH
Geralmente é o usuário cPanel do HostGator. Exemplo: `fran4942`

### 1.3 - Chave Privada SSH
No HostGator, execute:
```bash
cat ~/.ssh/id_rsa
```

**IMPORTANTE:** Copie TODO o conteúdo, do início (-----BEGIN...) até o final (-----END...)

### 1.4 - Porta SSH (Opcional)
Geralmente é `22`, mas pode ser diferente. Pergunte ao HostGator ou use:
```bash
echo $SSH_PORT
```

---

## Passo 2: Adicionar Secrets no GitHub

### 2.1 - Abra o GitHub
1. Acesse: https://github.com/gabrielfeelix/solar-buy-side-v2
2. Clique em **Settings** (no topo da página)
3. No menu lateral esquerdo, clique em **Secrets and variables**
4. Clique em **Actions**

### 2.2 - Adicionar cada secret

Você verá um botão "New repository secret". Clique nele para cada um:

#### Secret 1: HOSTGATOR_HOST
- **Name**: `HOSTGATOR_HOST`
- **Value**: IP ou hostname do seu servidor (ex: `seu-dominio.com` ou `123.45.67.89`)
- Clique em **Add secret**

#### Secret 2: HOSTGATOR_USER
- **Name**: `HOSTGATOR_USER`
- **Value**: Seu usuário SSH (ex: `fran4942`)
- Clique em **Add secret**

#### Secret 3: HOSTGATOR_SSH_KEY
- **Name**: `HOSTGATOR_SSH_KEY`
- **Value**: Cole TODO o conteúdo da chave privada (`~/.ssh/id_rsa`)

  **Exemplo do conteúdo:**
  ```
  -----BEGIN OPENSSH PRIVATE KEY-----
  b3BlbnNzaC1rZXktdjEAAAAABG5vbmUtbm9uZS1ub25lAAAAAI...
  [muitas linhas aqui]
  -----END OPENSSH PRIVATE KEY-----
  ```

- Clique em **Add secret**

#### Secret 4 (Opcional): HOSTGATOR_SSH_PORT
Se a porta SSH NÃO for `22`:
- **Name**: `HOSTGATOR_SSH_PORT`
- **Value**: A porta (ex: `2222`)
- Clique em **Add secret**

---

## Passo 3: Validação

### 3.1 - Confirmar que os secrets foram adicionados
Na página de Secrets, você deve ver:
- ✅ HOSTGATOR_HOST
- ✅ HOSTGATOR_USER
- ✅ HOSTGATOR_SSH_KEY
- ✅ HOSTGATOR_SSH_PORT (se necessário)

### 3.2 - Testar o deploy
1. Faça uma pequena mudança no repositório (ex: adicione um comentário em um arquivo)
2. Commit e push para `main`:
   ```bash
   git add .
   git commit -m "test deploy"
   git push origin main
   ```

3. Vá para **Actions** no GitHub
4. Veja o workflow sendo executado
5. Se tudo passar, confira se a landing page foi atualizada no HostGator

---

## 🔒 Segurança

**IMPORTANTE:**
- ❌ NÃO commite a chave privada no repositório
- ❌ NÃO compartilhe os secrets com ninguém
- ❌ NÃO coloque os secrets em nenhum arquivo (use apenas os secrets do GitHub)
- ✅ GitHub encrypta os secrets automaticamente
- ✅ Os secrets só são visíveis para você no repositório
- ✅ Os secrets são mascarados nos logs do Actions

---

## Troubleshooting

### "Permission denied (publickey)"
A chave SSH não está correta ou não foi adicionada ao GitHub

**Solução:**
1. Verifique se copiou a chave completa (BEGIN até END)
2. Teste a chave no HostGator: `ssh -T git@github.com`
3. Recrie o secret se necessário

### "Failed to connect to host"
O HOSTGATOR_HOST está incorreto

**Solução:**
1. Verifique o IP/hostname do servidor
2. Teste a conexão: `ping seu-host.com`
3. Corrija o secret no GitHub

### "npm: command not found"
Node.js não está instalado no HostGator

**Solução:**
Contacte o HostGator para instalar Node.js ou configure em outro lugar

---

## Próximos passos

Depois de configurar os secrets:

1. ✅ Confirme que o deploy automático funciona
2. ✅ Teste fazer uma mudança e fazer push
3. ✅ Monitore o Actions para ver se o workflow executa
4. ✅ Verifique se a landing page foi atualizada

---

**Precisa de ajuda?**
- Verifique o arquivo `DEPLOYMENT.md` para mais informações
- Veja os logs do Actions no GitHub para troubleshooting
- Contacte o HostGator se tiver problemas com SSH

---

**Última atualização**: 2026-02-01
