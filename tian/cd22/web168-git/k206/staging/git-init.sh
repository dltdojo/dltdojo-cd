#!/bin/sh
echo "=== k206/staging ==="
mkdir -p /app/repo/foo
git config --system http.receivepack true
git config --system http.uploadpack true
git config --system user.email "gitserver@dev.local"
git config --system user.name "Git Server"
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
cd /app/repo/foo &&  git init --bare -q
mkdir -p /app/repo/bar206 && cd /app/repo/bar206 && git init -q --bare
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
lighttpd -D -f /etc/lighttpd/lighttpd.conf