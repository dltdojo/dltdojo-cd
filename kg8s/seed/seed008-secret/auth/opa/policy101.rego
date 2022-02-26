#
# [Open Policy Agent | Policy Primer via Examples](https://www.openpolicyagent.org/docs/latest/envoy-primer/)
#
package envoy.authz

import input.attributes.request.http as http

httpbin_common_static := ["/","/flasgger_static/**", "/static/**", "/spec.json", "/oauth2/**"]

default allow = false

claims := payload {
	[_, encoded] := split(http.headers.authorization, " ")
	[_, payload, _] := io.jwt.decode(encoded)
}

# Allow httpbin common resources /flagger_static
allow {
	# iterate over values
	iter_glob_paths := httpbin_common_static[_]
	glob.match(iter_glob_paths, [], http.path)
}

allow {
  # Assignment: declare local variable x and give it value 7
  # x := 7
  # https://www.openpolicyagent.org/docs/latest/policy-reference/#iteration
  # iterate over values
  # val := arr[_]
  # iterate over claims.groups array
  role := claims.groups[_]
  print("role",role)
    # check role in permission
  user_roles = permission.roles[role]

  # iterate over keys
  # obj[key]
  user_roles[k]
  # check route/path match
  glob.match(k, [], http.path)

  # check method
  user_roles[k][_] = http.method
}

permission = {
  "roles": {
    "httpbin-viewer": {
      "/headers": ["GET"],
      "/status/*": ["GET"],
    },
    "httpbin-editor": {
      "/headers": ["GET"],
      "/status/*": ["GET", "POST", "PUT"],
      "/ip": ["GET"]
    },
    "httpbin-admin": {
      "/**": ["GET", "POST", "PATCH", "PUT", "DELETE"]
    }
  }
}