#!/bin/sh
#
IMG=foo1234

chatgpt_comment_md() {
    echo "cat ../llvm-chatgpt.sh | deno run -A app.ts chatgpt -r code -m 'explain the following bash script:' -i >> ../llvm-chatgpt.md"
}

docker build -t $IMG - <<'EOF'
FROM debian:11
RUN apt-get update && apt-get install wget lsb-release wget software-properties-common gnupg -y
RUN <<EOOF
wget https://apt.llvm.org/llvm.sh
chmod +x llvm.sh
./llvm.sh 15
EOOF
EOF

docker run -i $IMG <<'EOF' 2>&1 | tee /dev/tty | sed 's/cpp-output/ChatGPT-LLMs-inference/;s/"hello.c", c/hello world, human/'
cat > hello.c <<EOOF
#include <stdio.h>
int main(void) {
    printf("Hello! World!\n");
}
EOOF
clang-15 -ccc-print-phases hello.c
EOF
