
apt update && apt full-upgrade -y
apt-get autoremove -y
apt-get clean -y
apt-get install -f -y
useradd -m -G sudo -s /bin/bash $1
passwd $1
usermod -a -G inet $1
echo '%sudo ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers
