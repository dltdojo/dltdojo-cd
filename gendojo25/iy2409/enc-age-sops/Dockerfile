FROM debian:testing-20240904
RUN <<EOF
apt-get update
apt-get install -y age wget
wget https://github.com/getsops/sops/releases/download/v3.9.0/sops-v3.9.0.linux.amd64 -O /usr/bin/sops && chmod +x /usr/bin/sops
EOF