import {LabelsInterface} from "../../labels";
import {KubernetesAddons} from "./k8sAddons";

export interface KubernetesNodeGroupVolume{
    size?: number;
    type?: string;
}

export interface KubernetesNodeGroupScalePolicy{
    autoScaleMode?: boolean;
    initialSize?: number;
    autoScaleMin?: number;
    autoScaleMax?: number;
    downCoolDownTimeMinutes?: number;
}

export interface KubernetesNodeGroupTaint{
    effect: string;
    key: string;
    value: string;
}

export interface KubernetesNodeGroupAuthConfig{
    method: string;
    keyPair?: string;
    password?: string;
}

export interface KubernetesNodeGroup{
    name: string;
    authConfig: KubernetesNodeGroupAuthConfig;

    flavorId?: string;
    scalePolicy?: KubernetesNodeGroupScalePolicy;
    type?: string;
    os?: string;
    priority?: number;
    runtime?: string;
    nodeLabels?: LabelsInterface;
    nodeTaints?: KubernetesNodeGroupTaint[];
    rootVolume?: KubernetesNodeGroupVolume;
    dataVolumes?: KubernetesNodeGroupVolume[];
    labels?: LabelsInterface;
}

export interface KubernetesCluster{
    name: string;
    network: string;
    subnet: string;
    nodeGroups: KubernetesNodeGroup[];

    availabilityZone: string;
    addons?: KubernetesAddons;
    flavorId?: string;
    version?: string;
    containerNetworkType?: string;
    elasticIp?: string;
    clusterType?: string;
    labels?: LabelsInterface;
}

export interface KubernetesClusterOutput{
    name: string;
    endpoint: string;

    clientCertificate: string;
    clientKey: string;
    caCertificate: string;

    config: string;
}

export interface KubernetesClustersOutputMap{
    [key: string]: KubernetesClusterOutput
}

export interface KubernetesNodeGroupOutput{
    name: string;
    clusterId: string;
    password: string;
    keyPair: string;
}

export interface KubernetesNodeGroupsOutputMap{
    [key: string]: KubernetesNodeGroupOutput
}