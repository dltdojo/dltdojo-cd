# Git

- T1 搭建一個 git 遠端版本庫測試場景並完成一次 git push

# T1 git push

```sh
docker run --name gitea -i --rm -p 3000:3000 -e INSTALL_LOCK=true -e SECRET_KEY=ONLY4TEST gitea/gitea:1.15.5 /bin/bash <<\EOF
env
/bin/s6-svscan /etc/s6 &
sleep 10
gitea admin user create --admin --username=admin199 --password=admin199pass --email=admin@local --must-change-password=false
sleep 1
gitea admin user create --username alice --password pass101 --email alice@foo.local --must-change-password=false
sleep 1
curl -sX POST -H "accept: application/json" -H "Content-Type: application/json" \
    -d '{"name": "repo-foo", "auto_init": true}' http://alice:pass101@localhost:3000/api/v1/user/repos
sleep 1
cd /tmp
git clone http://alice:pass101@localhost:3000/alice/repo-foo.git
cd repo-foo
git config --global user.email "alice@foo.local"
git config --global user.name "alice"
echo "# The Times 03/Jan/2009 Chancellor on brink of second bailout for banks" > foo.md
git add .
git commit -m "add foo.md"
git push -u origin master
sleep 1
curl -sv http://localhost:3000/alice/repo-foo/raw/branch/master/foo.md
tail -f /dev/null
EOF

docker stop gitea
```

- [git](https://github.com/git/git)
- [go-gitea/gitea: Git with a cup of tea, painless self-hosted git service](https://github.com/go-gitea/gitea)
- [Git - 關於版本控制](https://git-scm.com/book/zh-tw/v2/%E9%96%8B%E5%A7%8B-%E9%97%9C%E6%96%BC%E7%89%88%E6%9C%AC%E6%8E%A7%E5%88%B6)
- [用Git版本控制【Git的基本介紹】 | 連猴子都能懂的Git入門指南 | 貝格樂（Backlog）](https://backlog.com/git-tutorial/tw/intro/intro1_1.html)

# WIP

- GitOps 
  - [Infrastructure as code - Wikipedia](https://en.wikipedia.org/wiki/Infrastructure_as_code)
  - example : docker mount volume (docker compose yaml)
