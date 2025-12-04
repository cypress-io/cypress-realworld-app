#!/bin/bash

echo "==========================================="
echo "       CONFIGURAÇÃO GLOBAL DO CYPRESS"
echo "==========================================="
echo ""

# 1️⃣ Criar pasta fixa de cache (sem espaços) no F:
CACHE_DIR="/f/cypress-cache"
echo "Criando pasta de cache global em: $CACHE_DIR"
mkdir -p "$CACHE_DIR"

# 2️⃣ Configurar variável de ambiente permanente no Git Bash
BASHRC="$HOME/.bashrc"

if ! grep -q "CYPRESS_CACHE_FOLDER" "$BASHRC"; then
    echo "" >> "$BASHRC"
    echo "# Cypress global cache folder" >> "$BASHRC"
    echo "export CYPRESS_CACHE_FOLDER=\"$CACHE_DIR\"" >> "$BASHRC"
    echo "Variável CYPRESS_CACHE_FOLDER adicionada ao ~/.bashrc"
else
    echo "Variável CYPRESS_CACHE_FOLDER já existe no ~/.bashrc"
fi

# 3️⃣ Aplicar variável de ambiente na sessão atual
export CYPRESS_CACHE_FOLDER="$CACHE_DIR"

# 4️⃣ Limpar cache antigo do Cypress (caso exista)
echo ""
echo "Limpando cache antigo do Cypress..."
yarn cypress cache clear

# 5️⃣ Reinstalar binário do Cypress
echo ""
echo "Reinstalando binário do Cypress..."
yarn cypress install

# 6️⃣ Finalização
echo ""
echo "==========================================="
echo "CYPRESS CONFIGURADO GLOBALMENTE COM SUCESSO!"
echo "Cache: $CYPRESS_CACHE_FOLDER"
echo "Agora você pode abrir Cypress em qualquer projeto usando:"
echo "  yarn cypress open"
echo "==========================================="
