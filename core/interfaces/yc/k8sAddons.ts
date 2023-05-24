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

    createNamespace?: boolean;
    isLocal?: boolean;
    version?: string;
    repository?: string;
}

export interface KubernetesHelmAdditionalManifest{
    name: string;
    path: string;
}

export interface KubernetesHelmReleaseExtended{
    release: KubernetesHelmRelease;
    additionalManifests?: KubernetesHelmAdditionalManifest[];
}

export interface KubernetesS3Storage{
    enabled: boolean;

    bucket?: string;
    serviceAccount?: string;
}

export interface KubernetesAddons{
    ingress: KubernetesAddonsIngress;
    certManager: KubernetesAddonsCertManager;
    dashboard: KubernetesAddonsDashboard;
    s3Storage: KubernetesS3Storage;
}