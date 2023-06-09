// Kubernetes module
import {KubernetesAddons} from "./k8sAddons";
import {LabelsInterface} from "../../labels";

export interface KubernetesWorkerGroupResources{
    memory?: number;
    cpu?: number;
    diskSize? : number;
    diskType? : string;
}

export interface KubernetesWorkerGroupScalePolicy{
    autoScaleMode?: boolean;
    fixedScaleSize? : number;
    autoScaleMin? : number;
    autoScaleMax? : number;
    autoScaleInitial? : number;
}

export interface KubernetesWorkerGroup{
    name: string;
    instanceName: string;

    scalePolicy? : KubernetesWorkerGroupScalePolicy;
    platformId?: string;
    version?: string;
    preemptible?: boolean;
    nodeLabels? : LabelsInterface;
    nodeTaints? : string[];
    resources? : KubernetesWorkerGroupResources;
    nat? : boolean;
    autoUpgrade? : boolean;
    autoRepair? : boolean;
    labels?: LabelsInterface;
}


export interface KubernetesAdditionalParams{
    clusterIpv4Range: string;
    serviceIpv4Range: string;
}
export interface Kubernetes{
    name: string;
    network: string;
    subnet: string;
    clusterSa: string;
    nodesSa: string;

    workerGroups: KubernetesWorkerGroup[];

    addons: KubernetesAddons;

    isPublic?: boolean;
    version?: string;
    additionalParams? : KubernetesAdditionalParams;
    labels?: LabelsInterface;
}


export interface KubernetesClustersOutput{
    name: string;
    endpoint: string;
    caCert: string;
}
export interface KubernetesClustersOutputMap{
    [key: string] : KubernetesClustersOutput
}