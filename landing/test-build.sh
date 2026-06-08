#!/bin/bash
# Script para testar se o build funciona localmente antes de fazer push

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Test Build Script ===${NC}\n"

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

log_section() {
    echo -e "\n${BLUE}► $1${NC}"
}

# Step 1: Verificar Node.js
log_section "Verificando Node.js"
if ! command -v node &> /dev/null; then
    log_error "Node.js não instalado"
    exit 1
fi
log_info "Node $(node --version)"
log_info "NPM $(npm --version)"

# Step 2: Verificar se node_modules existe
log_section "Verificando dependências"
if [ ! -d "node_modules" ]; then
    log_warning "node_modules não encontrado, executando npm install"
    npm install
else
    log_info "node_modules encontrado"
fi

# Step 3: Rodando linter
log_section "Executando linter (ESLint)"
if npm run lint; then
    log_info "Linter passou ✓"
else
    log_error "Erros de linter encontrados"
    log_warning "Continuando mesmo com erros de linter..."
fi

# Step 4: Build
log_section "Gerando build"
if ! npm run build; then
    log_error "Build falhou!"
    exit 1
fi
log_info "Build concluído com sucesso ✓"

# Step 5: Verificar dist
log_section "Validando output do build"
if [ ! -d "dist" ]; then
    log_error "Pasta dist não foi criada"
    exit 1
fi

if [ -z "$(ls -A dist)" ]; then
    log_error "Pasta dist está vazia"
    exit 1
fi

DIST_SIZE=$(du -sh dist | cut -f1)
FILE_COUNT=$(find dist -type f | wc -l)
log_info "Pasta dist criada com sucesso"
log_info "Tamanho: $DIST_SIZE"
log_info "Arquivos: $FILE_COUNT"

# Step 6: Verificar se tem index.html
if [ ! -f "dist/index.html" ]; then
    log_error "index.html não encontrado em dist/"
    exit 1
fi
log_info "index.html encontrado ✓"

# Step 7: Verificar se tem assets
if [ ! -d "dist/assets" ]; then
    log_warning "Pasta assets não encontrada (isso pode estar ok dependendo da build)"
else
    ASSET_COUNT=$(ls dist/assets | wc -l)
    log_info "Assets: $ASSET_COUNT arquivos"
fi

# Success
log_section "✓ Build validado com sucesso!"
echo ""
echo -e "${GREEN}Você pode fazer push com segurança:${NC}"
echo "  git add ."
echo "  git commit -m 'sua mensagem'"
echo "  git push origin main"
echo ""
echo -e "${YELLOW}Dica:${NC} O deploy automático será acionado após o push."
echo -e "Acompanhe em: https://github.com/gabrielfeelix/solar-buy-side-v2/actions"
