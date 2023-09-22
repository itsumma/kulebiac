export interface KubernetesHelmReleaseSet{
    name: string;
    value: string;
}

export interface KubernetesAddonsIngress{
    enabled: boolean;
    network: string;
    subnet: string;

    eipType?: string;
    chartVersion?: string;
    values?: string;
    set?: KubernetesHelmReleaseSet[];
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

export interface KubernetesAddons{
    ingress?: KubernetesAddonsIngress;
    certManager?: KubernetesAddonsCertManager;
    dashboard?: KubernetesAddonsDashboard;
    manifests?: KubernetesAdditionalManifest[];
}

export interface KubernetesHelmRelease{
    name: string;
    namespace: string;
    chart: string;
    set: KubernetesHelmReleaseSet[];

    wait: boolean;
    disableOpenapiValidation: boolean;

    rawValues?: string[];
    values?: string|string[];
    createNamespace?: boolean;
    isLocal?: boolean;
    version?: string;
    repository?: string;
}

export interface KubernetesAdditionalManifest{
    name: string;
    path: string;
}

export interface KubernetesHelmReleaseBasicAuth{
    enabled: boolean;
    userName?: string;
    secretName?: string;
}

export interface KubernetesHelmReleaseExtended{
    release: KubernetesHelmRelease;

    basicAuth?: KubernetesHelmReleaseBasicAuth;
    additionalManifests?: KubernetesAdditionalManifest[];
    //rawManifests?: KubernetesAdditionalRawManifest[];
}