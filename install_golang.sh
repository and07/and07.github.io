#!/bin/bash

echo 'Update'
echo ''
sudo apt update
echo ''
echo ''

echo 'Upgrade'
echo ''
sudo apt upgrade
echo ''
echo ''

echo 'Figlet'
echo ''
sudo apt install figlet
echo ''
echo ''

figlet install golang

sudo apt install golang

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

