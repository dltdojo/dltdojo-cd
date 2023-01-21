#!/bin/sh
cat<<EOF >> /home/workspace/.bashrc
alias la='ls -lah'
EOF
mkdir /home/workspace
git clone http://gitsrv205.default.svc.cluster.local:80/git/foo
cd /home/workspace/foo
git config --global user.email "foo1001@testing.local"
git config --global user.name "FooName1001"
echo hello-world-vscode-git >> README.md
git status
git add .
git status
git commit -m 'vscode git : commit'
git status
git push
git log
git checkout -b issue302
git branch
echo $(date) >> README.md
/home/.openvscode-server/bin/openvscode-server --host 0.0.0.0 --without-connection-token &
sleep 5
echo "open http://localhost:3000/?folder=/home/workspace/foo"
wait