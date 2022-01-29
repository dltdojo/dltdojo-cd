package play

# import future.keywords.in
#
# [Poor Man’s Authorization: How to Implement RBAC for REST API with OPA | HackerNoon](https://hackernoon.com/poor-mans-authorization-how-to-implement-rbac-for-rest-api-with-opa)
#
default allow = false

req_user := ["editor","admin"]
req_path := "/security/abc"
req_method := "GET"

allow {
  # https://www.openpolicyagent.org/docs/latest/policy-language/
  # The formal syntax uses the semicolon character ; to separate expressions. Rule bodies can separate expressions with newlines and omit the semicolon:
  # expression-1 AND expression-2 AND ... AND expression-N
  # 順序沒差都需 true
  #
  # https://www.openpolicyagent.org/docs/latest/faq/#which-equality-operator-should-i-use
  # Which Equality Operator Should I Use? :=, ==, =
  #
  # Assignment: declare local variable x and give it value 7
  # x := 7
  # https://www.openpolicyagent.org/docs/latest/policy-reference/#iteration
  # iterate over values
  # val := arr[_]
  # iterate over req_user array
  role := req_user[_]
  print("role",role)
  # = Unification: assign variables to values that make the equality true
  # x = 7               # causes x to be assigned 7
  # [x, 2] = [3, y]     # x is assigned 3 and y is assigned 2
  # check role in permission
  user_roles = permission.roles[role]
  print("user_roles", user_roles)

  # check route in permission.roles.ROLE key: k ?
  # iterate over keys
  # obj[key]
  user_roles[k]
  print("k", user_roles)
  # check route match
  glob.match(k, [], req_path)

  # check method
  user_roles[k][_] = req_method
}

# console output
# policy.rego:16: role editor
# policy.rego:18: user_roles {"/ip/*": ["GET", "POST"], "/security/*": ["GET", "POST", "PUT"]}
# policy.rego:21: k {"/ip/*": ["GET", "POST"], "/security/*": ["GET", "POST", "PUT"]}
# policy.rego:21: k {"/ip/*": ["GET", "POST"], "/security/*": ["GET", "POST", "PUT"]}
# policy.rego:16: role admin
# policy.rego:18: user_roles {"/**": ["GET", "POST", "PUT", "DELETE"]}
# policy.rego:21: k {"/**": ["GET", "POST", "PUT", "DELETE"]}
#

permission = {
  "roles": {
    "viewer": {
      "/security/*": ["GET"],
      "/ip/*": ["GET"]
    },
    "editor": {
      "/security/*": ["GET", "POST", "PUT"],
      "/ip/*": ["GET", "POST"]
    },
    "admin": {
      "/**": ["GET", "POST", "PUT", "DELETE"]
    }
  }
}