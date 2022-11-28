# syntax=docker/dockerfile:1.3-labs
FROM golang:1.19.3 AS devgolang101
RUN <<EOF
cd /go/src
cat <<EOOF > main.go
package main
import (
    "context"
    "time"
    "fmt"
    "log"
    clientv3 "go.etcd.io/etcd/client/v3"
)
func main() {
    cli, err := clientv3.New(clientv3.Config{
    Endpoints:   []string{"etcd101:2379"},
    })
    fmt.Println("Hello, World")
}
EOOF
go mod init main
go mod tidy
EOF

FROM node:18.12-alpine3.16 AS devnode101
WORKDIR /app
RUN <<EOF
npm install --save etcd3
EOF