#!/bin/bash
sudo apt update
sudo apt upgrade
sudo apt install golang
mkdir ~/workspace
mkdir ~/workspace/go
export GOPATH=~/workspace/go
export PATH=$PATH:$GOPATH/bin
echo "export GOPATH=~/workspace/go" >> ~/.profile
echo "export PATH=$PATH:$GOPATH/bin" >> ~/.profile
cat ~/.profile
