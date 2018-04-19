#!/bin/bash

echo 'Update'
echo ''
apt update
echo ''
echo ''

echo 'Upgrade'
echo ''
apt upgrade
echo ''
echo ''

echo 'Figlet'
echo ''
apt install figlet
echo ''
echo ''

figlet install golang

apt install golang

echo ''

figlet Create Work Dir

mkdir ~/workspace
mkdir ~/workspace/go


figlet Envelopment

export GOPATH=~/workspace/go
export PATH=$PATH:$GOPATH/bin
echo "export GOPATH=~/workspace/go" >> ~/.profile
echo "export PATH=$PATH:$GOPATH/bin" >> ~/.profile
cat ~/.profile

