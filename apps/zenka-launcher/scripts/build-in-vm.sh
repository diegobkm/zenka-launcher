#!/bin/bash
# Script para sincronizar o codigo do Zenka Launcher com a VM Oracle e disparar o build
# Configuravel via variaveis de ambiente:
#   VM_USER  -> usuario SSH (default: ubuntu)
#   VM_HOST  -> IP/host da VM (obrigatorio)
#   SSH_KEY  -> caminho da chave privada (obrigatorio)
#   REMOTE_DIR -> pasta remota (default: ~/zenka-launcher)

VM_USER="${VM_USER:-ubuntu}"
REMOTE_DIR="${REMOTE_DIR:-~/zenka-launcher}"

if [ -z "$VM_HOST" ]; then
  echo "[build-in-vm] Defina VM_HOST com o endereco da VM."
  exit 1
fi

if [ -z "$SSH_KEY" ]; then
  echo "[build-in-vm] Defina SSH_KEY com o caminho da chave privada."
  exit 1
fi

if [ ! -f "$SSH_KEY" ]; then
  echo "[build-in-vm] Chave SSH nao encontrada: $SSH_KEY"
  echo "[build-in-vm] Defina a variavel SSH_KEY apontando para o arquivo .key"
  exit 1
fi

echo "[build-in-vm] Destino: $VM_USER@$VM_HOST:$REMOTE_DIR"
echo "[build-in-vm] Sincronizando arquivos com a VM Oracle..."
scp -o StrictHostKeyChecking=accept-new -i "$SSH_KEY" -r . "$VM_USER@$VM_HOST:$REMOTE_DIR/"

if [ $? -ne 0 ]; then
  echo "[build-in-vm] Falha na sincronizacao (scp). Abortando."
  exit 1
fi

echo "[build-in-vm] Disparando build na VM..."
ssh -o StrictHostKeyChecking=accept-new -i "$SSH_KEY" "$VM_USER@$VM_HOST" \
  "cd $REMOTE_DIR && npm install && npx expo export:embed --platform android"

if [ $? -ne 0 ]; then
  echo "[build-in-vm] Build falhou na VM. Veja o log acima."
  exit 1
fi

echo "[build-in-vm] Build concluido com sucesso!"
