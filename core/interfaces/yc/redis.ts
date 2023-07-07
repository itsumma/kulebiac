import {LabelsInterface} from "../../labels";

export interface RedisHost{
    subnet: string;

    isPublic?: boolean;
}

export interface RedisClusterResources{
    resourcePresetId?: string;
    diskSize?: number;
    diskTypeId: string;
}

export interface RedisCluster{
    name: string;
    network: string;
    host: RedisHost;

    environment?: string;
    version?: string;
    resources?: RedisClusterResources;
    databases?: number;
    persistence?: string;
    tlsEnabled?: boolean;
    labels?: LabelsInterface;
}

export interface RedisHostOutput{
    type: string;
    value: string;
}

export interface RedisHostOutputMap{
    [key: string]: RedisHostOutput
}

export interface RedisPasswordOutput{
    clusterId: string;
    password: string;
}

export interface RedisPasswordsOutputMap{
    [key: string] : RedisPasswordOutput;
}
