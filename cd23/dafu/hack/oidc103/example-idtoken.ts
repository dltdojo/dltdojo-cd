
const _ExampleSigstoreIdToken = `
{
  iss: "https://oauth2.sigstore.dev/auth",
  sub: "CgxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxvYXV0aA",
  aud: "sigstore",
  exp: 1678235910,
  iat: 1678235850,
  at_hash: "XUxxxxxxxx-zsNjzdQ",
  c_hash: "_Zixxxxx0TwiJ63UT7A",
  email: "y12studio@gmail.com",
  email_verified: true,
  federated_claims: { connector_id: "https://github.com/login/oauth", user_id: "1840874" }
}
`
const _ExampleVaultIdToken = `
{
  at_hash: "i8ANGnGH6V_wXtAFBbAQdw",
  aud: "GnzKrJYO4wB6M4HrFNyaFvaK7tdKzSzd",
  c_hash: "NJGz4eRV9oXHQ1bahv0pEw",
  contact: { email: "vault@hashicorp.com", phone_number: "123-456-7890" },
  exp: 1678081037,
  groups: [ "engineering" ],
  iat: 1678079237,
  iss: "http://vault101.default.svc:8200/v1/identity/oidc/provider/my-provider",
  namespace: "root",
  sub: "7d21f0b1-f37a-49c8-2db0-830ce25fb383",
  username: "end-user"
}
`

const _ExampleMicrosoftAzureAd = `
{
  ver: "2.0",
  iss: "https://login.microsoftonline.com/XXXXXXXXXXXXXXXXXXXXXXXXXx/v2.0",
  sub: "XXXXXXXXXXXXXXXx",
  aud: "XXXXXXXXXXXXXXXX",
  exp: 1678261138,
  iat: 1678174438,
  nbf: 1678174438,
  email: "y12studio@gmail.com",
  tid: "xxxxxxxx-6c67-4c5b-b112-xxxxxxxxx",
  aio: "xxxxxxxxxxxx"
}
`

const _ExampleGithubUserInfo = `
{
  login: "y12studio",
  id: 1800087,
  node_id: "xxx",
  avatar_url: "https://avatars.githubusercontent.com/u/1840874?v=4",
  gravatar_id: "",
  url: "https://api.github.com/users/y12studio",
  html_url: "https://github.com/y12studio",
  followers_url: "https://api.github.com/users/y12studio/followers",
  following_url: "https://api.github.com/users/y12studio/following{/other_user}",
  gists_url: "https://api.github.com/users/y12studio/gists{/gist_id}",
  starred_url: "https://api.github.com/users/y12studio/starred{/owner}{/repo}",
  subscriptions_url: "https://api.github.com/users/y12studio/subscriptions",
  organizations_url: "https://api.github.com/users/y12studio/orgs",
  repos_url: "https://api.github.com/users/y12studio/repos",
  events_url: "https://api.github.com/users/y12studio/events{/privacy}",
  received_events_url: "https://api.github.com/users/y12studio/received_events",
  type: "User",
  site_admin: false,
  name: "Joye Lin",
  company: "@dltdojo ",
  blog: "https://dltdojo.org",
  location: "Taichung, Taiwan",
  email: "y12studio@gmail.com",
  hireable: true,
  bio: null,
  twitter_username: null,
  public_repos: 78,
  public_gists: 46,
  followers: 64,
  following: 9,
  created_at: "2012-06-12T03:09:05Z",
  updated_at: "2023-02-22T11:49:37Z"
}`

const _ExampleGoogle = `
{
  iss: "https://accounts.google.com",
  azp: "19788210000-xxxxxxxxxxxxxxxx.apps.googleusercontent.com",
  aud: "19788210000-xxxxxxxxxxxxxxxx.apps.googleusercontent.com",
  sub: "11605000000000000",
  email: "y12studio@gmail.com",
  email_verified: true,
  at_hash: "xxxxxxxxxx",
  name: "XXX",
  picture: "XX",
  given_name: "XX",
  family_name: "X",
  locale: "zh-TW",
  iat: 1678177316,
  exp: 1678180916
}
`