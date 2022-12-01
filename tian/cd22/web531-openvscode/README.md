# gitpod openvscode-server

gitpod-io/openvscode-server: Run upstream VS Code on a remote machine with access through a modern web browser from any device, anywhere. https://github.com/gitpod-io/openvscode-server

# 🍟 101 vscode server

- gitpod/openvscode-server Tags | Docker Hub https://hub.docker.com/r/gitpod/openvscode-server/tags
- dockerfile https://github.com/gitpod-io/openvscode-releases/blob/27f1d59c71c735a17eccfe6f2483bd1b6ea9d485/Dockerfile#L65
- yaml testing https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml
- http://localhost:3000

```sh
docker run -it --init -p 3000:3000 -v "$(pwd):/home/workspace:cached" gitpod/openvscode-server:1.73.1
```

正常與使用 redhat.vscode-yaml 之後查閱執行設定

```sh
docker run -i --init --rm --entrypoint=sh gitpod/openvscode-server:1.73.1 <<EOF
env
ls -alh /home/.openvscode-server/bin
/home/.openvscode-server/bin/openvscode-server -h
EOF
```

output

```sh
GIT_EDITOR=code --wait
HOSTNAME=1c891294d5a4
OPENVSCODE_SERVER_ROOT=/home/.openvscode-server
HOME=/home/workspace
VISUAL=code
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
LANG=C.UTF-8
LC_ALL=C.UTF-8
PWD=/home/workspace
EDITOR=code
total 20K
drwxr-xr-x 1 openvscode-server openvscode-server 4.0K Nov 11 11:55 .
drwxr-xr-x 1 openvscode-server openvscode-server 4.0K Nov 11 11:55 ..
drwxr-xr-x 1 openvscode-server openvscode-server 4.0K Nov 11 11:55 helpers
-rwxr-xr-x 1 openvscode-server openvscode-server  249 Nov 11 11:40 openvscode-server
drwxr-xr-x 1 openvscode-server openvscode-server 4.0K Nov 11 12:08 remote-cli
OpenVSCode Server 1.73.1

Usage: openvscode-server [options]

Options
  --host <ip-address>            The host name or IP address the server should
                                 listen to. If not set, defaults to
                                 'localhost'.
  --port <port | port range>     The port the server should listen to. If 0 is
                                 passed a random free port is picked. If a
                                 range in the format num-num is passed, a free
                                 port from the range (end inclusive) is
                                 selected.
  --socket-path <path>           The path to a socket file for the server to
                                 listen to.
  --connection-token <token>     A secret that must be included with all
                                 requests.
  --connection-token-file <path> Path to a file that contains the connection
                                 token.
  --without-connection-token     Run without a connection token. Only use this
                                 if the connection is secured by other means.
  --accept-server-license-terms  If set, the user accepts the server license
                                 terms and the server will be started without
                                 a user prompt.
  --server-data-dir              Specifies the directory that server data is
                                 kept in.
  --telemetry-level <level>      Sets the initial telemetry level. Valid levels
                                 are: 'off', 'crash', 'error' and 'all'. If
                                 not specified, the server will send telemetry
                                 until a client connects, it will then use the
                                 clients telemetry setting. Setting this to
                                 'off' is equivalent to --disable-telemetry
  --user-data-dir <dir>          Specifies the directory that user data is kept
                                 in. Can be used to open multiple distinct
                                 instances of Code.
  -h --help                      Print usage.

Troubleshooting
  --log <level> Log level to use. Default is 'info'. Allowed values are
                'critical', 'error', 'warn', 'info', 'debug', 'trace', 'off'.
                You can also configure the log level of an extension by
                passing extension id and log level in the following format:
                '${publisher}.${name}:${logLevel}'. For example:
                'vscode.csharp:trace'. Can receive one or more such entries.
  -v --version  Print version.

Extensions Management
  --extensions-dir <dir>              Set the root path for extensions.
  --install-extension <ext-id | path> Installs or updates an extension. The
                                      argument is either an extension id or a
                                      path to a VSIX. The identifier of an
                                      extension is '${publisher}.${name}'. Use
                                      '--force' argument to update to latest
                                      version. To install a specific version
                                      provide '@${version}'. For example:
                                      'vscode.csharp@1.2.3'.
  --uninstall-extension <ext-id>      Uninstalls an extension.
  --list-extensions                   List the installed extensions.
  --show-versions                     Show versions of installed extensions,
                                      when using --list-extensions.
  --category <category>               Filters installed extensions by provided
                                      category, when using --list-extensions.
  --pre-release                       Installs the pre-release version of the
                                      extension, when using
                                      --install-extension
  --start-server                      Start the server when installing or
                                      uninstalling extensions. To be used in
                                      combination with 'install-extension',
                                      'install-builtin-extension' and
                                      'uninstall-extension'.
```

install redhat.vscode-yaml before server starting

ENTRYPOINT [ "/bin/sh", "-c", "exec ${OPENVSCODE_SERVER_ROOT}/bin/openvscode-server --host 0.0.0.0 --without-connection-token \"${@}\"", "--" ]

```sh
docker run -i --init --rm -p 3000:3000 --entrypoint=sh gitpod/openvscode-server:1.73.1 <<EOF
env
/home/.openvscode-server/bin/openvscode-server --install-extension=redhat.vscode-yaml
/home/.openvscode-server/bin/openvscode-server --host 0.0.0.0 --without-connection-token 
EOF
```
# 🍞 102 preinstalled extensions

安裝 redhat.vscode-yaml

- YAML - Visual Studio Marketplace https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml

```sh
docker compose -f docker-compose.102.yaml up
```

# 🍜 103 docker

安裝 redhat.vscode-yaml 與 ms-azuretools.vscode-docker

- Docker - Visual Studio Marketplace https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker
- YAML - Visual Studio Marketplace https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml

假設主機有 docker 群組存在不須 sudo 執行 docker 指令，容器內的使用者需加入外部 docker 群組避開取用權限問題。如果無法使用 getent group docker 取得 GID，可以手動設定 docker compose yaml user 位置。

須注意容器內 apt-get 不需要安裝 docker 服務端的 docker-ce，這套件會新增 docker group，並產生對應的 GID，如果容器安裝 docker-ce 可能會衝到主機使用的 docker group，這時要先刪掉容器內 docker group 再 groupadd 補上 host 端的 docker gid 避免出現找不到 gid 訊息，當然最好是不裝 docker-ce。

```sh
GID="$(getent group docker | cut -d: -f3)" docker compose -f docker-compose.103.yaml up
```

# 🍙 104 kubernetes

- Kubernetes - Visual Studio Marketplace https://marketplace.visualstudio.com/items?itemName=ms-kubernetes-tools.vscode-kubernetes-tools

如不需要 docker 可拿掉 GID 的部份，kubectl 無 GID 問題，不過必須使用特殊 network: host 設定。另外 KUBEHOME 會被 ms-kubernetes-tools.vscode-kubernetes-tools 用來寫入資訊，複製到 /tmp 避免與主機衝突。

如果 firefox 出現 terminal 沒有回應的問題，建議切換到 chrome。

```sh
k3d cluster create foo1999
GID="$(getent group docker | cut -d: -f3)" docker compose -f docker-compose.104.yaml up
```

