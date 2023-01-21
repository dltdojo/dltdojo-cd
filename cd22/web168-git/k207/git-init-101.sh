#!/bin/sh
#
# https://pkgs.alpinelinux.org/package/edge/main/x86/git-gitweb
#
if [ ! -f /usr/libexec/git-core/git-instaweb ]
then
    echo "alpine apk add lighttpd and git-http-backend and gitweb"
    apk --no-cache add busybox-extras curl git-daemon lighttpd git-gitweb perl-cgi
    date
fi
env
id
mkdir -p /app/repo/foo
git config --system http.receivepack true
git config --system http.uploadpack true
git config --system user.email "gitserver@dev.local"
git config --system user.name "Git Server"
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
cd /app/repo/foo &&  git init --bare -q && echo "K207 foo" > description
mkdir -p /app/repo/bar && cd /app/repo/bar && git init -q --bare && echo "K207 bar" > description
mkdir -p /app/repo/bob101 && cd /app/repo/bob101 && git init -q --bare && echo "K207 bob101" > description
#
# https://github.com/ryan0x44/local-git-server
#
cat <<\EOF > /etc/lighttpd/lighttpd.conf
server.document-root = "/app/repo"
server.modules += ( "mod_alias", "mod_cgi", "mod_setenv" )
$HTTP["host"] =~ "" {
    alias.url += ( "/git" => "/usr/libexec/git-core/git-http-backend")
    $HTTP["url"] =~ "^/git" {
        cgi.assign = ( "" => "" )
        setenv.add-environment = (
            "GIT_PROJECT_ROOT" => "/app/repo",
            "GIT_HTTP_EXPORT_ALL" => "1"
            )
    }
}
EOF
echo "git instaweb /app/repo/foo port 1234"
cd /app/repo/foo &&  git instaweb
lighttpd -D -f /etc/lighttpd/lighttpd.conf