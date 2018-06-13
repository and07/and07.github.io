#!/bin/bash

if [ -f '/etc/redhat-release' ];
then
    #yum
fi

if [ -f '/etc/debian_version' ];
then
  apt-get update && apt-get full-upgrade -y
  apt-get autoremove -y
  apt-get clean -y
  apt-get install -f -y
  useradd -m -G sudo -s /bin/bash $1
  passwd $1

  echo '%sudo ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers
fi


#for android
#usermod -a -G inet $1

