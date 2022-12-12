#!/bin/sh
cat<<EOF >> /home/workspace/.bashrc
alias la='ls -lah'
EOF
curl -sv --retry 10 --retry-all-errors http://gitsrv207.default.svc.cluster.local:80/git/foo/
mkdir /home/workspace
git clone http://gitsrv207.default.svc.cluster.local:80/git/foo
cd /home/workspace/foo
git config --global user.email "foo1001@testing.local"
git config --global user.name "FooName1001"
/home/.openvscode-server/bin/openvscode-server --host 0.0.0.0 --without-connection-token &
echo "open http://vscode.localhost:8300/?folder=/home/workspace/foo"
wait