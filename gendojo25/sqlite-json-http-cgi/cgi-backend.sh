#!/bin/bash
echo "Content-type: text/plain"
echo
# example /cgi-bin/add.sh?a=2&b=3
eval $(echo ${QUERY_STRING//&/;})
THE_TABLE="FOO$RANDOM"
echo "CREATE TABLE $THE_TABLE( A int, B int);" | sqlite3 /tmp/test.db
echo "INSERT INTO $THE_TABLE(A, B) VALUES ($a,$b);" | sqlite3 /tmp/test.db
echo "SELECT A + B FROM $THE_TABLE;" | sqlite3 /tmp/test.db