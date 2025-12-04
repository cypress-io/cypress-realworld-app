#!/bin/bash

echo "==========================================="
echo "     CONFIGURANDO CACHE DO CYPRESS"
echo "==========================================="
echo ""

# 1️⃣ Criar pasta de cache sem espaços
CACHE_DIR="/c/cypress-cache"
echo "Criando pasta de cache em: $CACHE_DIR"
mkdir -p "$CACHE_DIR"

# 2️⃣ Definir variável de ambiente apenas para esta sessão
export CYPRESS_CACHE_FOLDER="$CACHE_DIR"
echo ""
echo "CYPRESS_CACHE_FOLDER definido como:"
echo "  $CYPRESS_CACHE_FOLDER"

# 3️⃣ Limpar cache antigo do Cypress
echo ""
echo "Limpando cache antigo do Cypress..."
yarn cypress cache clear

# 4️⃣ Reinstalar Cypress
echo ""
echo "Reinstalando binário do Cypress..."
yarn cypress install

# 5️⃣ Abrir Cypress
echo ""
echo "Abrindo Cypress..."
yarn cypress open

echo ""
echo "==========================================="
echo "              PROCESSO FINALIZADO"
echo "==========================================="
