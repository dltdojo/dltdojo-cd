範例學習


- [opa - How to check if given string is contained in tags - Stack Overflow](https://stackoverflow.com/questions/68719071/how-to-check-if-given-string-is-contained-in-tags)
- [istio - Using opa for abac to check user claims agains defined policies - Stack Overflow](https://stackoverflow.com/questions/69429429/using-opa-for-abac-to-check-user-claims-agains-defined-policies)



[Istio / Better External Authorization](https://istio.io/latest/blog/2021/better-external-authz/)

OPA 接受 istio/envoy 傳入格式如下。可以直接用 [The Rego Playground](https://play.openpolicyagent.org/) 確認。

[opa-envoy-plugin/examples/istio at main · open-policy-agent/opa-envoy-plugin](https://github.com/open-policy-agent/opa-envoy-plugin/tree/main/examples/istio)

```json
{
  "parsed_path": ["api", "v1", "products"],
  "parsed_query": {"lang": ["en"]},
  "parsed_body":  {"id": "ext1", "name": "opa_authz"},
  "attributes": {
    "source": {
      "address": {
        "Address": {
          "SocketAddress": {
            "address": "172.17.0.10",
            "PortSpecifier": {
              "PortValue": 36472
            }
          }
        }
      }
    },
    "destination": {
      "address": {
        "Address": {
          "SocketAddress": {
            "address": "172.17.0.17",
            "PortSpecifier": {
              "PortValue": 9080
            }
          }
        }
      }
    },
    "request": {
      "http": {
        "id": "13359530607844510314",
        "method": "GET",
        "headers": {
          ":authority": "192.168.99.100:31380",
          ":method": "GET",
          ":path": "/api/v1/products?lang=en",
          "accept": "*/*",
          "authorization": "Basic YWxpY2U6cGFzc3dvcmQ=",
          "content-length": "0",
          "user-agent": "curl/7.54.0",
          "x-b3-sampled": "1",
          "x-b3-spanid": "537f473f27475073",
          "x-b3-traceid": "537f473f27475073",
          "x-envoy-internal": "true",
          "x-forwarded-for": "172.17.0.1",
          "x-forwarded-proto": "http",
          "x-istio-attributes": "Cj4KE2Rlc3RpbmF0aW9uLnNlcnZpY2USJxIlcHJvZHVjdHBhZ2UuZGVmYXVsdC5zdmMuY2x1c3Rlci5sb2NhbApPCgpzb3VyY2UudWlkEkESP2t1YmVybmV0ZXM6Ly9pc3Rpby1pbmdyZXNzZ2F0ZXdheS02Nzk5NWM0ODZjLXFwOGpyLmlzdGlvLXN5c3RlbQpBChdkZXN0aW5hdGlvbi5zZXJ2aWNlLnVpZBImEiRpc3RpbzovL2RlZmF1bHQvc2VydmljZXMvcHJvZHVjdHBhZ2UKQwoYZGVzdGluYXRpb24uc2VydmljZS5ob3N0EicSJXByb2R1Y3RwYWdlLmRlZmF1bHQuc3ZjLmNsdXN0ZXIubG9jYWwKKgodZGVzdGluYXRpb24uc2VydmljZS5uYW1lc3BhY2USCRIHZGVmYXVsdAopChhkZXN0aW5hdGlvbi5zZXJ2aWNlLm5hbWUSDRILcHJvZHVjdHBhZ2U=",
          "x-request-id": "92a6c0f7-0250-944b-9cfc-ae10cbcedd8e"
        },
        "path": "/api/v1/products?lang=en",
        "host": "192.168.99.100:31380",
        "protocol": "HTTP/1.1",
        "body": "{\"id\": \"ext1\", \"name\": \"opa_authz\"}"
      }
    }
  }
}
```

# oauth2-proxy cookie 於 opa 無法解析取值驗證

oauth2-proxy cookie 加密並且使用壓縮算法，不可能在 opa 內對 cookie 解密與解壓取得 jwt token 來做過濾，還是要 oauth2-proxy 來轉注入 http header authorization。

- https://github.com/oauth2-proxy/oauth2-proxy/blob/42475c28f7f235c08777a24027fe8ec170763482/pkg/apis/sessions/session_state.go#L122
- [Unable to Decrypt access token from oauth2-proxy cookie · Issue #950 · oauth2-proxy/oauth2-proxy](https://github.com/oauth2-proxy/oauth2-proxy/issues/950)

> cookies are stored in a 3 part (value + timestamp + signature) to enforce that the values are as originally set. additionally, the 'value' is encrypted so it's opaque to the browser

https://github.com/oauth2-proxy/oauth2-proxy/blob/42475c28f7f235c08777a24027fe8ec170763482/pkg/encryption/utils.go#L67

用 ```|``` 分成三段

```
Cookie: _oauth2_proxy_prom=V6-GChaowtxrSTvfGM4537H_01cg3FPMzPROoiE5AtjeCJOWjgj_tlpJRfu0nXzp6hBaB5ZsKQBBpM22qOoG_Rb_9rU5HKalTKJaX89QqhQsCrNDP1AQklOAdYsoM21hjKssAkTnum9gpWH9iqfh2da_KB5FIk7_3XRYW-ke6y3GuDi0yA4-voiqEXBgOxh3vIEIPM5-PofWxIZNgluKWaFWJ6cMISDXX_GvMZqekbyO4UjAuHGBBosHtUK_zg8Vj5f54G0LRQgYo-9Oz3EtNHTSUf4_JQJxo1BJJEcivTzm5wtrtIuz50uybcf87UjNGz3vPeVR6UtmFM8rFaKjjkA1YJZ6jaokvH6cj7Mk3s2kn5X1I2qYynhv3LuEKtAPVnoOBtBDMv4H6GfntVPig4fzBlRpnB86FYAycGBap8NrdSYla5BAydahOBZSW1JykwdAzdxJFUSkrzE7nDr3RzCCOOe9iyotIyy9huvPB_uCCMrPcec2psi7MitzkUsDXrIDDBJwrd6PnGzpl-SYAmoZgBDFvYVoSz3xIvrYCuO_8Eja2e7j0HO73u-W2NZIal2qHZRgXcKewRYH3Wf3gKdrbePjVRfyr8-ausLoJgLbGt2d9MNYrcTbxq4948PDPFPh4_AFYyi88vaSXleTVxXByyAaiIkh8KoDc-H_o_fcqMKaGLndkkJsBQgAC9xpe_GKRm3Ryiuo3jbLct5QsMZ1JNyS0_Xj_FSOIx4-fSOd8ACByguKBTzPO3gRsgdptcFiglIzyKjyYFhdSU0YdwjgZohnsqkCI3Y0Kda9T90HLtzSuAO6hEny6N6RvBp_Wavi-y8C12002zTfvLAzAUFpu9e0pl_gfT8pLQpexagC1LLStePZWCxP6NUTtZ7HaO3ZvyDfpiY0j1wq-vfPif3Km27_LGLl8iUvlKDXYXU4cEUzbnzPLXVSYH6ilATaQxKYIQdYdFYwNvb-IM2kl8_Ag8bvB9GHup5R6nunemt_0AuEtdwpPkEOusbtDzX0X-wYXcJKD2s0bjdAMyo1EJ-eI5luUy0bOyt2bs_5TgQM9wMIV5ZEGRsMqImM8ipovN6jfkIStpp5A6A4loYk2T-KMkrpjG8rc0uDSUG3gn0MxVqYES6XvoC62gw_JtPnbDJsDXqobnbIWFS3GpSmc75XpZ3T1dde7s1syqyeZAorp4OxQiO5k7RNq2J2oJyyQjiz2cd70hSu2BZFmUV4f21KEbvLDLtg7m4q-I8Etv4gRfAhGHKZgVT0vFuzfY5R11BC0_q7s5LajL-DhZngbLeB-QCYUWvroWwkw7cHHDeun4Y2AYm7wUcAN7rBVZILAaf7iiMW-PGfSAw0CiVnQYh5WJxWhoRK5ghtBC2XnskX4az_fr5VpDOqeXC4j-ihtOjeXmXhIULie_zoWU_CQKQKwQS8NSIhV8j8L0fxC1IfQgllSMh0HTyCQKAVmTYIKgIN3qKRHeFFbiSgzv3aBekeNznsp89PKApUEvW9Pb3MaQP9oi1KyF6lCntmwtWO6967zR-UQJCmYa1SlBHoMZx5EHRM6zkFIu0MVHNFv2t54MYys4TZoiTRvbMm5Ei8WaW3yevu5KzOxduc5XaioVxBBEQiypecKzNXfTFoldno7xmLAu5M2fmFFF5mHXwCPUXyGaDAWQtUnzHdN_0jvJYPX_qV0x2qFE1QX6PXc0iq_CjuHLVRc2pQFmlHbHh8koD4l0Qu50ZE8EVSgTPHPKcBee6tYGKItv-sHrAlEKUl2yLq5Mv6bPt8GYTEcYbE3BIkjSD5V81ih2-lAdL_f3aq92gYuWzuXI19LAQSHjUGSGtmzfU8BqhjIMZckocb6qpJuMAewq06YqW8Vany_hfnsRL9JvohQl3Wexu7eL6nPkg8f2s9zTTEaAiJ_Bowi45MyxxaYHlYhrqSPZMh09X9hZ3AtW9s8JjCsYuE8C0GCKe3jtlbfroU68BFgGLl_n9p4m3FFfhXQU44aYPb4-5G0WdnlwvJxug0XwBO5VjNDkHWc-gqbACopxA4_KhXoAVbqnregmITsM6pwXxJwSqUxER-FZgC2T5QuEoDDk6l3qxwaAr1A-Axd2nuseE4yXy-E_sFWCAjKvrR2dR7EQiQy0de89NZrMcrZona6-X35QSZO2JYc-vdSX-yeWqyT_jE6ocf_cKk38e2l4R5oXLxaUokj7kkcmUxN2AEfUKFz1zBzBnN-x_B8J-H5UpcqCpCweUZaMBdv4FJAfOJKPVssKbsfqUIuKbSZLbGWAzkz08wUBCzQHdiZtzAUZAb127DVHdRpxQWosNsG9pVZtiKxD6d5Jf6gTRW5duxTpx5aAWqczjR41ueMlib2_U5z0qE0gYcx3YFtm1QuQ5oAGFwl2c5zpcjUHYEqhFrTFG6QgsLK3YYlYjrrHTSLAN82x6OpaRqDIHCJt0etHHmC-D5D7jaEqd4in6q4SxWGqMvOQ2fndi4VvOm_gR6siXdTximidZ0e1RvASQQpMZoEUNNXVkJI6UOsYFYU4VdLtpVqG6ktiHF-8sX8B-m0EJxo-gc67dqbZDdEfEVXRMpoleeSXdBs2jNGlyWHims1QAblwnQ1wKVP2P0vOKoE5721S5mV85D4LMnt6t0JhqVDhS_Ws7W1ShKsiJ9s2P8ywcEgB3xIkpy5EjPU62-6xaOI7eIdSrwqDhdSTiMTWcNzQ_Ow4GJ1TApGOHfVskEEmdqPjfKX_KUbK9v7re12HyeQlI50nmkjjZBndAtzuNQKwL1XM4AZmHDiPznZY0l5iofFvLvyCzsrMlr6kZgMnrh9x5cw8IMp9XicroPQ2FW-l8kPUwSEXtA60p9pLdrh593tTm5flpMO4SImmpe2EvdAe-khN78BOcpYvT6SSAqZkQ5dQfLoff8sQiJXPeFuI86W3PaGWgJ7u4jViC8m2N2_RPKi4qM1lIbNLH--i0b3nzGI95UB7zR4h4U3B0VTQLiJQn4_ECwF3izUOdnNhIhG9kI8sD3-SF3ngd8M9w6lgBAk8o3Y3QJCiVl_UtOCzFWQfADF4Boq7hogDNITVYQntmQvmQzglsUa9EOL3s5FFsKF1VUmSYp1tmjgcrzDpcTBySz7oCGi-DhkVRJvtNyE7eMXxsqJh6wvY04G1jmTZzkb77QZCt1QRQPGfn4JN-OGx5rb5E-ylG7ps5N5VfuOHZfgJCNIV2btmNJEjsG7OysJjdMSSFB8h2UfdVeM2VsaxWdl81KUrSbqekWuTQJsXp3HQWmg1dzdpu26jXdywqK4FaCsNyKvB7qju0ogd5kTjBT7kgfS5y9Sr3ZpmdZKNHl2yIRCK2dSG5WkgvFEv037AVCzZVUbHPjBtlKER-75WDnByAD0wFzGdCKQYAaGW3eew5A4sVUQWFdDYCG3NuUZLbQKBbP9Hh0RCop3VLaZfAqkN7hXTpi30X2ni34bDUDUnVhDnegNBPovcCjO1UKUw4dLyePFT5Hz8ZJ6VC_F2LbBFgtQmEncu-rw1q1pvGvzEH3JDMc6Yc2ePIKxt_hQcgcjftMooOb-v1qYAa384xz6dKVbDebWejW6SRy-gIYzdyph7thgsGiQV8vE9wXCbyuuKT8p2byGYy-Gwdxjj_Nt6MwCVTO_2HVwMwkuueX5-jXhFCVOSbAO5s=|1641862347|aKinFplFN4Rc0MKrRMaejYJSOtmi16PPajePKyrDKbg=
```

TestSignAndValidate

https://github.com/oauth2-proxy/oauth2-proxy/blob/42475c28f7f235c08777a24027fe8ec170763482/pkg/encryption/utils_test.go#L85

```
func TestSignAndValidate(t *testing.T) {
	seed := "0123456789abcdef"
	key := "cookie-name"
	value := base64.URLEncoding.EncodeToString([]byte("I am soooo encoded"))
	epoch := "123456789"
	sha256sig, err := cookieSignature(sha256.New, seed, key, value, epoch)
	assert.NoError(t, err)
	assert.True(t, checkSignature(sha256sig, seed, key, value, epoch))
	assert.False(t, checkSignature(sha256sig, seed, key, "tampered", epoch))
}
```

oauth2-proxy cookie validate()

https://github.com/oauth2-proxy/oauth2-proxy/blob/42475c28f7f235c08777a24027fe8ec170763482/pkg/encryption/utils.go#L36

```go
func Validate(cookie *http.Cookie, seed string, expiration time.Duration) (value []byte, t time.Time, ok bool) {
	// value, timestamp, sig
	parts := strings.Split(cookie.Value, "|")
	if len(parts) != 3 {
		return
	}
	if checkSignature(parts[2], seed, cookie.Name, parts[0], parts[1]) {
		ts, err := strconv.Atoi(parts[1])
		if err != nil {
			return
		}
		// The expiration timestamp set when the cookie was created
		// isn't sent back by the browser. Hence, we check whether the
		// creation timestamp stored in the cookie falls within the
		// window defined by (Now()-expiration, Now()].
		t = time.Unix(int64(ts), 0)
		if t.After(time.Now().Add(expiration*-1)) && t.Before(time.Now().Add(time.Minute*5)) {
			// it's a valid cookie. now get the contents
			rawValue, err := base64.URLEncoding.DecodeString(parts[0])
			if err == nil {
				value = rawValue
				ok = true
				return
			}
		}
	}
	return
}

```