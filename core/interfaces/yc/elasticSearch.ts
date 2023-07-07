import {LabelsInterface} from "../../labels";

export interface ElasticSearchClusterNodeResources{
    resourcePresetId?: string;
    diskTypeId? :string;
    diskSize?: number;
}

export interface ElasticSearchClusterNodeConfig{
    resources? : ElasticSearchClusterNodeResources;
}

export interface ElasticSearchClusterConfig{
    dataNode?: ElasticSearchClusterNodeConfig;
    version?: string;
    edition?: string;
    plugins?: string[];
}

export interface ElasticSearchCluster{
    name: string;
    network: string;
    subnet: string;
    environment: string;

    config?: ElasticSearchClusterConfig;
    isPublic?: boolean;
    labels?: LabelsInterface;
}

export interface ElasticSearchCLusterPasswordsOutput{
    clusterId: string;
    password: string;
}

export interface ElasticSearchCLusterPasswordsOutputMap{
    [key: string] : ElasticSearchCLusterPasswordsOutput;
}

export interface ElasticSearchHostOutput{
    value: string;
}

export interface ElasticSearchHostOutputMap{
    [key: string] : ElasticSearchHostOutput
}