[MinIO | The MinIO Quickstart Guide](https://docs.min.io/docs/minio-quickstart-guide.html)

```
docker run -p 9000:9000 -p 9001:9001 \
  quay.io/minio/minio server /data --console-address ":9001"
```