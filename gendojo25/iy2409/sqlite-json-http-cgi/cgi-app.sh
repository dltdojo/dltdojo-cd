#!/bin/bash
echo "Content-type: text/plain"
echo
# example /cgi-bin/add.sh?a=2&b=3
eval $(echo ${QUERY_STRING//&/;})
result=$((a+b))
echo $result