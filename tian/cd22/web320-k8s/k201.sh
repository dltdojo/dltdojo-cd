#! /bin/sh
kubectl delete -f k201.yaml
kubectl apply -f k201.yaml
kubectl get all
kubectl wait --for=condition=complete job.batch/job101
echo "=== logs pod labels run=my-nginx ==="
kubectl logs -l run=my-nginx
echo "=== logs job101 box501 ==="
kubectl logs job.batch/job101 box501
echo "=== logs job101 curl501 ==="
kubectl logs job.batch/job101 curl501
