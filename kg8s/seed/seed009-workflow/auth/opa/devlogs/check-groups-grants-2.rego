package play

import future.keywords.in
#
# [opa - How to check if given string is contained in tags - Stack Overflow](https://stackoverflow.com/questions/68719071/how-to-check-if-given-string-is-contained-in-tags)
#
# id_token claim groups is list type
#
input_token := { "claim_groups" : ["httpbin-user", "dev101"] }

# construct a set from an array
# https://www.openpolicyagent.org/docs/latest/policy-language/#set-comprehensions
# b := {x | x = a[_]}
set_groups := { x | x = input_token.claim_groups[_]}
  
check_group_in_role_grants_key {
  some key
  role_grants[key]
  # check if key belongs to the set
  key in set_groups
}

grants := {val |
  some key
  key in set_groups
  val := role_grants[key]
}

role_grants := {
	"httpbin-user": [
		   {"/public*": ["GET"]},
           {"/ip*": ["GET"]}
		],
	"httpbin-editor": [
		  {"/*": ["GET", "POST", "PUT"]}
		],
	"httpbin-admin": [
		  {"/*": ["GET", "POST", "PUT", "DELETE"]}
	    ],
}