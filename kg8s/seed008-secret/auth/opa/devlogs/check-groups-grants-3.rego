package play

import future.keywords.in
#
# [opa - How to check if given string is contained in tags - Stack Overflow](https://stackoverflow.com/questions/68719071/how-to-check-if-given-string-is-contained-in-tags)
#
# id_token claim groups is list type
#
xinput := {
  "path": "/ip" ,
  "token" : {
    "claim_groups" : ["httpbin-user", "dev002"] 
  }
}

# construct a set from an array
# https://www.openpolicyagent.org/docs/latest/policy-language/#set-comprehensions
# b := {x | x = a[_]}
set_groups := { x | x = xinput.token.claim_groups[_]}
  
check_group_in_role_grants_key {
  some key
  # check if key belongs to the set
  key in set_groups
  grants := role_grants[key]
  # ?
  # ?
  # glob.match(grants[_], [], xinput.path)
}

grants := {val |
  some key
  key in set_groups
  val := role_grants[key]
}

hello := grants[_]

role_grants := {
	"httpbin-user": {
		   "/public*": ["GET"],
           "/ip*": ["GET"]
		},
	"httpbin-editor": {
		  "/*": ["GET", "POST", "PUT"]
		},
	"httpbin-admin": {
		  "/*": ["GET", "POST", "PUT", "DELETE"]
	    }
}