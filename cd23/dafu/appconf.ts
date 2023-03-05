export const CONF = {
    KCONF_DIR: "kconf100",
    REGISTRY_HOST_101: 'registry.local',
    REGISTRY_PORT_101: '5001',
    ERGISTRY_REPO_101: 'hellok8s',
    DEV_BUSYBOX_TAG_101: '0.1.5-busyboxhello',
    DEV_DENO_APK_TAG_101: '0.1.5-denoapk',
    GenRanString: () => {
        return Math.random().toString(36).substring(2, 7);
    },
    REGISTRY_HOST_PORT_101: () => `${CONF.REGISTRY_HOST_101}:${CONF.REGISTRY_PORT_101}`
}

export const K8S_SERVICE = {
    KEDA_URL_DEPLOYMENT: 'https://github.com/kedacore/keda/releases/download/v2.9.2/keda-2.9.2.yaml',
    KEDA_FILENAME: 'keda-2.9.2.yaml',
    REDIS_FILENAME: 'redis-7.0.9.yaml',
    REDIS_IMG: "redis:7.0.9-alpine3.17",
    REDIS_SRV_ID: "redis101",
    VAULT_FILENAME: 'vault-1.12.3.yaml',
    VAULT_IMG: "vault:1.12.3",
    VAULT_SRV_ID: "vault101",
    DENO_IMG_101: 'denoland/deno:1.31.1'
}