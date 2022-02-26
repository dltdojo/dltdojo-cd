```sh
openssl req -new -x509 -nodes -newkey ec:<(openssl ecparam -name secp256r1) -subj '/O=LOCALDEV/CN=CA.TESTONLY.LOCAL' -keyout ca.key -out ca.crt -days 3650
openssl req -out sslip.io.csr -newkey ec:<(openssl ecparam -name secp256r1) -nodes -keyout sslip.io.key -subj "/CN=*.127.0.0.1.sslip.io/O=LOCALDEV"
openssl x509 -req -days 3650 -CA ca.crt -CAkey ca.key -set_serial 0x$(openssl rand -hex 8) \
  -extfile <(printf "subjectAltName=DNS:*.127.0.0.1.sslip.io") \
  -in sslip.io.csr -out sslip.io.crt
```

result

```sh
$ openssl x509 -in sslip.io.crt -text -noout
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number:
            f8:14:6b:60:a1:7a:81:fe
        Signature Algorithm: ecdsa-with-SHA256
        Issuer: O = LOCALDEV, CN = CA.TESTONLY.LOCAL
        Validity
            Not Before: Jan  3 10:07:41 2022 GMT
            Not After : Jan  1 10:07:41 2032 GMT
        Subject: CN = *.127.0.0.1.sslip.io, O = LOCALDEV
        Subject Public Key Info:
            Public Key Algorithm: id-ecPublicKey
                Public-Key: (256 bit)
                pub:
                    04:2a:5d:57:72:18:21:77:a2:f0:05:9a:ae:85:99:
                    e4:e0:db:9f:c2:0e:d8:88:b0:25:49:35:ba:0f:e2:
                    9f:97:05:f0:37:a8:97:fd:17:6e:9f:1a:09:ad:7e:
                    4d:41:cc:28:99:a1:70:86:09:7b:a5:6e:d8:dd:47:
                    af:db:ef:92:9f
                ASN1 OID: prime256v1
                NIST CURVE: P-256
        X509v3 extensions:
            X509v3 Subject Alternative Name: 
                DNS:*.127.0.0.1.sslip.io
    Signature Algorithm: ecdsa-with-SHA256
         30:46:02:21:00:ca:0e:a7:4a:5d:7a:eb:fe:3a:87:44:4e:be:
         47:70:a8:ee:40:76:5c:74:c4:b0:0f:13:14:af:cf:84:b2:d7:
         70:02:21:00:d5:44:6f:d9:d6:ed:58:0e:27:10:b0:96:40:3f:
         5a:c1:a0:6d:fb:a4:04:dd:56:1d:cc:f1:c1:54:db:e4:a1:f4

$ openssl x509 -in ca.crt -text -noout
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number:
            38:36:1d:fa:a1:78:74:2a:10:dc:be:57:9d:1d:5c:68:81:bd:c5:7f
        Signature Algorithm: ecdsa-with-SHA256
        Issuer: O = LOCALDEV, CN = CA.TESTONLY.LOCAL
        Validity
            Not Before: Jan  3 09:28:10 2022 GMT
            Not After : Jan  1 09:28:10 2032 GMT
        Subject: O = LOCALDEV, CN = CA.TESTONLY.LOCAL
        Subject Public Key Info:
            Public Key Algorithm: id-ecPublicKey
                Public-Key: (256 bit)
                pub:
                    04:df:95:62:38:0e:19:15:b2:ed:96:93:ed:b5:13:
                    19:2c:11:8d:53:17:23:7a:25:27:65:58:18:52:c5:
                    61:10:b2:1b:8d:cf:ba:55:54:09:db:50:5c:2a:18:
                    b3:5f:f3:17:6c:1a:ad:3c:df:0c:9f:f2:f4:8e:7c:
                    4d:3e:c6:24:69
                ASN1 OID: prime256v1
                NIST CURVE: P-256
        X509v3 extensions:
            X509v3 Subject Key Identifier: 
                13:DA:29:08:01:34:E4:02:A3:A9:5C:30:3F:AB:71:CF:7B:4F:D7:C1
            X509v3 Authority Key Identifier: 
                keyid:13:DA:29:08:01:34:E4:02:A3:A9:5C:30:3F:AB:71:CF:7B:4F:D7:C1

            X509v3 Basic Constraints: critical
                CA:TRUE
    Signature Algorithm: ecdsa-with-SHA256
         30:46:02:21:00:fa:d4:e5:a1:83:76:74:49:b8:d5:34:3b:11:
         a9:14:ba:58:47:63:e8:a9:5c:7b:ce:2f:f0:e8:f1:ca:71:cc:
         bb:02:21:00:8e:b0:45:3f:1e:95:72:53:fb:ae:98:d0:2e:de:
         ba:06:cc:18:dd:06:23:70:7e:ae:2c:21:23:3c:56:91:72:14
```