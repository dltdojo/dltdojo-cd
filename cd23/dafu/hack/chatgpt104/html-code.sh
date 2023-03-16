#!/bin/bash
TEMP_HTML="$(mktemp)"
TEMP_MD="$(mktemp).md"
README=html-code.md
SCRIPT=html-code.sh

md_code_block() {
    echo -e "\n## $1\n" >> $README
    echo -e "\n$(date)\n" >> $README
    echo -e "\`\`\`$2\n" >> $README
    cat $3 >> $README
    echo -e "\n\`\`\`\n" >> $README
}

script_explain() {
  md_code_block "explain shell script" "sh" $SCRIPT
  echo -e "\n## chatgpt response\n" >> $README
  cat $SCRIPT | deno run -A app.ts chatgpt -r code -m 'explain the following shell script:' -i >> $README
}

curl_html_code_snippet() {
    curl -s "https://etherscan.io/address/0x27f706edde3aD952EF647Dd67E24e38CD0803DD6#code" | grep -A 150 -B 4 "pragma solidity" | cut -c 1-150
}

review_solidity_code() {
    echo -e "$(curl_html_code_snippet)" > $TEMP_HTML
    md_code_block "html code snippet" "text" $TEMP_HTML
    echo -e "\n## chatgpt response\n" >> $README
    cat $TEMP_HTML | deno run -A app.ts chatgpt -r code -m 'Extract solidity code content between the HTML `pre` tags in following HTML code snippet:' -i > $TEMP_MD
    cat $TEMP_MD >> $README
    sleep 2
    echo -e "\n## explain solidity contract\n" >> $README
    cat $TEMP_MD | deno run -A app.ts chatgpt -r code -m 'Explain the following solidity contract:' -i >> $README
    sleep 2
    echo -e "\n## review solidity contract\n" >> $README
    cat $TEMP_MD | deno run -A app.ts chatgpt -r code -m 'Review the following solidity contract and let me known if there are any security vulnderabilities?' -i >> $README
}

echo -e "\n# $(date)\n" >> $README
script_explain
review_solidity_code