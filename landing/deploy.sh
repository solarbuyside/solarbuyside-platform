#!/bin/bash
set -e  # Exit on any error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para logging
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Diretórios
REPO_DIR=~/repos/solar-buy-side-v2
PUBLIC_HTML=~/public_html
BACKUP_DIR=~/backup_before_deploy_$(date +%Y%m%d_%H%M%S)

# Validar que estamos no diretório correto
if [ ! -d "$REPO_DIR" ]; then
    log_error "Diretório do repositório não encontrado: $REPO_DIR"
    exit 1
fi

log_info "Iniciando deploy..."
log_info "Data: $(date)"

# Step 1: Entrar no diretório do repositório
cd "$REPO_DIR"
log_info "Diretório atual: $(pwd)"

# Step 2: Fazer pull das atualizações
log_info "Fazendo pull do repositório..."
if ! git pull; then
    log_error "Falha ao fazer pull do repositório"
    exit 1
fi
log_info "Pull concluído com sucesso"

# Step 3: Instalar dependências
log_info "Instalando dependências com npm..."
if ! npm install --prefer-offline --no-audit; then
    log_error "Falha ao instalar dependências"
    exit 1
fi
log_info "Dependências instaladas com sucesso"

# Step 4: Fazer build
log_info "Gerando build do projeto..."
if ! npm run build; then
    log_error "Falha ao gerar build"
    exit 1
fi
log_info "Build concluído com sucesso"

# Step 5: Validar que dist foi criado
if [ ! -d "$REPO_DIR/dist" ]; then
    log_error "Pasta dist não foi criada após build"
    exit 1
fi
log_info "Pasta dist validada"

# Step 6: Criar backup do public_html (se existir e tiver conteúdo)
if [ -d "$PUBLIC_HTML" ] && [ "$(ls -A $PUBLIC_HTML)" ]; then
    log_info "Criando backup de $PUBLIC_HTML em $BACKUP_DIR..."
    mkdir -p "$BACKUP_DIR"
    cp -r "$PUBLIC_HTML"/* "$BACKUP_DIR/" || true
    log_info "Backup criado com sucesso"
else
    log_warning "Diretório $PUBLIC_HTML vazio ou não existe, pulando backup"
fi

# Step 7: Limpar public_html
log_info "Limpando diretório $PUBLIC_HTML..."
mkdir -p "$PUBLIC_HTML"
rm -rf "$PUBLIC_HTML"/* || true
log_info "Diretório limpo com sucesso"

# Step 8: Copiar build para public_html
log_info "Copiando build para $PUBLIC_HTML..."
if ! cp -r "$REPO_DIR/dist"/* "$PUBLIC_HTML/"; then
    log_error "Falha ao copiar arquivos de build"
    log_warning "Restaurando backup de $BACKUP_DIR..."
    if [ -d "$BACKUP_DIR" ]; then
        rm -rf "$PUBLIC_HTML"/*
        cp -r "$BACKUP_DIR"/* "$PUBLIC_HTML/" || true
    fi
    exit 1
fi
log_info "Build copiado com sucesso para $PUBLIC_HTML"

# Step 9: Validar que arquivos foram copiados
if [ ! "$(ls -A $PUBLIC_HTML)" ]; then
    log_error "Nenhum arquivo foi copiado para $PUBLIC_HTML"
    exit 1
fi

log_info "✓ Deploy concluído com sucesso!"
log_info "Arquivos disponíveis em: $PUBLIC_HTML"
log_info "Total de arquivos: $(find $PUBLIC_HTML -type f | wc -l)"
