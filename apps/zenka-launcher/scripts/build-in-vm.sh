#!/bin/bash
# Script para sincronizar o codigo do Zenka Launcher com a VM Oracle e disparar o build
# Configuravel via variaveis de ambiente (com defaults):
#   VM_USER  -> usuario SSH (default: ubuntu)
#   VM_HOST  -> IP/host da VM   (default: 163.176.218.128)
#   SSH_KEY  -> caminho da chave privada (default: ssh-key-2026-07-10.key ao lado do workspace)
#   REMOTE_DIR -> pasta remota (default: ~/zenka-launcher)

VM_USER="${VM_USER:-ubuntu}"
VM_HOST="${VM_HOST:-163.176.218.128}"
SSH_KEY="${SSH_KEY:-/c/Users/diego/Desktop/DIEGO/PROGRAMAS\ E\ ETC/DIEGO\ PROJETOS/TRABALHOS\ COM\ AUDIO,\ VIDEO\ E\ MIDIAS\ EM\ GERAL/ssh-key-2026-07-10.key}"
REMOTE_DIR="${REMOTE_DIR:-~/zenka-launcher}"

if [ ! -f "$SSH_KEY" ]; then
  echo "[build-in-vm] Chave SSH nao encontrada: $SSH_KEY"
  echo "[build-in-vm] Defina a variavel SSH_KEY apontando para o arquivo .key"
  exit 1
fi

echo "[build-in-vm] Destino: $VM_USER@$VM_HOST:$REMOTE_DIR"
echo "[build-in-vm] Sincronizando arquivos com a VM Oracle..."
scp -o StrictHostKeyChecking=no -i "$SSH_KEY" -r . "$VM_USER@$VM_HOST:$REMOTE_DIR/"

if [ $? -ne 0 ]; then
  echo "[build-in-vm] Falha na sincronizacao (scp). Abortando."
  exit 1
fi

echo "[build-in-vm] Disparando build na VM..."
ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$VM_USER@$VM_HOST" \
  "cd $REMOTE_DIR && npm install && npx expo export:embed --platform android"

if [ $? -ne 0 ]; then
  echo "[build-in-vm] Build falhou na VM. Veja o log acima."
  exit 1
fi

echo "[build-in-vm] Build concluido com sucesso!"
