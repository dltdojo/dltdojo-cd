#!/bin/sh
mkdir /repo
git clone http://gitsrv207.default.svc.cluster.local:80/git/foo /repo/foo
cd /repo/foo
ls -alh
git config --global user.email "bob@testing.local"
git config --global user.name "FooName1001"
git status
git log
echo hello-world-bob >> README.md
git add README.md
git commit -m 'bob update readme'
git push origin
git remote add contribution http://gitsrv207.default.svc.cluster.local:80/git/bob101
git push contribution
git checkout -b issue123
date >> README.md
git commit -am 'issue123: bob update readme'
git push contribution issue123
git tag v1.888
git push origin v1.888
git push contribution v1.888