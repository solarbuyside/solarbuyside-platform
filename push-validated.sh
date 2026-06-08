#!/bin/bash
# Script para fazer push com validação de build

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Validated Push Script ===${NC}\n"

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_section() {
    echo -e "\n${BLUE}► $1${NC}"
}

# Step 1: Verificar git status
log_section "Verificando git status"
if git status --porcelain | grep -q .; then
    log_info "Mudanças detectadas"
else
    log_error "Nenhuma mudança para commitar"
    exit 1
fi

# Step 2: Executar test-build.sh
log_section "Executando validação de build"
if ! bash test-build.sh; then
    log_error "Validação de build falhou!"
    log_warning "Resolva os erros acima e tente novamente"
    exit 1
fi

# Step 3: Git add
log_section "Preparando commit"
git add .
log_info "Arquivos adicionados"

# Step 4: Git commit (com editor)
log_section "Digite sua mensagem de commit"
log_info "O editor padrão será aberto"
if git commit; then
    log_info "Commit criado com sucesso"
else
    log_error "Commit cancelado"
    exit 1
fi

# Step 5: Verificar branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    log_warning "Você está na branch '$CURRENT_BRANCH'"
    read -p "Tem certeza que quer fazer push para '$CURRENT_BRANCH'? (s/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        log_info "Push cancelado"
        exit 0
    fi
fi

# Step 6: Git push
log_section "Fazendo push para $CURRENT_BRANCH"
if git push origin "$CURRENT_BRANCH"; then
    log_info "Push bem-sucedido!"

    log_section "✓ Pronto!"
    echo ""
    echo -e "${GREEN}Deploy automático foi acionado no GitHub!${NC}"
    echo -e "Monitore em: ${BLUE}https://github.com/gabrielfeelix/solar-buy-side-v2/actions${NC}"
    echo ""
else
    log_error "Push falhou!"
    exit 1
fi
