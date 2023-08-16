export interface KubernetesAddonsIngress{
    enabled: boolean;
    chartVersion? : string;
    values?: string;
    staticIp?: string;
    set? : KubernetesHelmReleaseSet[];
}

export interface KubernetesAddonsCertManager{
    enabled: boolean;
    chartVersion? : string;
    values?: string;
    set?: KubernetesHelmReleaseSet[];
    issuerData?: string;
}

export interface KubernetesAddonsDashboard{
    enabled: boolean;
    chartVersion? : string;
    values? : string;
    set? : KubernetesHelmReleaseSet[];
    createAdmin?: boolean;
}

export interface KubernetesHelmReleaseSet{
    name: string;
    value: string;
}

export interface KubernetesHelmRelease{
    name: string;
    namespace: string;
    chart: string;
    set: KubernetesHelmReleaseSet[];
    values: string;
    wait: boolean;
    disableOpenapiValidation: boolean;

    isLocal?: boolean;
    createNamespace?: boolean;
    repository?: string;
    version?: string;
}

export interface KubernetesAdditionalManifest{
    name: string;
    path: string;
}

export interface KubernetesAdditionalRawManifest{
    name: string;
    data: string;
}

export interface KubernetesHelmReleaseExtended{
    release: KubernetesHelmRelease;

    additionalManifests?: KubernetesAdditionalManifest[];
    rawManifests?: KubernetesAdditionalRawManifest[];
}

export interface KubernetesS3Storage{
    enabled: boolean;

    bucket?: string;
    serviceAccount?: string;
}

export interface KubernetesLockboxClusterSecretStore{
    sa: string;
    name: string;
}
export interface KubernetesLockboxOperator{
    enabled: boolean;

    secretStores?: KubernetesLockboxClusterSecretStore[];
    values?: string;
    chartVersion?: string;
    set?: KubernetesHelmReleaseSet[];
}

export interface KubernetesAddons{
    ingress?: KubernetesAddonsIngress;
    certManager?: KubernetesAddonsCertManager;
    dashboard?: KubernetesAddonsDashboard;
    s3Storage?: KubernetesS3Storage;
    lockboxOperator?: KubernetesLockboxOperator;
    manifests?: KubernetesAdditionalManifest[];
}