# Nushell

# 🍓 101 nushell

```sh
docker build -t nushell101 .
docker run -i --init --rm nushell101 nu -c "env;ls -l"
```

nushell 未支援 here document 輸入方式，需要一個檔案來寫入。

```sh
docker run -i --init --rm nushell101 <<EOF
cat <<\EOOF > foo.nu ; nu foo.nu
env
ls -l
date now
def greet [name] {
  ["hello" $name]
}
greet "world"
sys | get host
EOOF
EOF
```

或是 mktemp 版本

```sh
docker run -i --init --rm nushell101 <<EOF
tmpfile=$(mktemp)
cat <<\EOOF > $tmpfile ; nu $tmpfile
env
ls -l
date now
def greet [name] {
  ["hello" $name]
}
greet "world"
sys | get host
EOOF
EOF
```

# 🍔 102 Console.table()

[each | Nushell](https://www.nushell.sh/book/commands/each.html)
