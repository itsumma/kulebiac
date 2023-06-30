import {LabelsInterface} from "../../labels";

export interface MongoHost{
    subnet: string;

    isPublic?: boolean;
}

export interface MongoClusterResources{
    resourcePresetId?: string;
    diskSize?: number;
    diskTypeId: string;
}

export interface MongoAccess{
    dataLens? :boolean;
    dataTransfer?: boolean;
}

export interface MongoDatabase{
    dbName: string;
    userName: string;
}

export interface MongoUserPermission{
    dbName: string;
    roles?: string[];
}

export interface MongoAddUser{
    userName: string;
    permissions: MongoUserPermission[];
}

export interface MongoCluster{
    name: string;
    network: string;
    host: MongoHost;
    databases: MongoDatabase[];

    environment?: string;
    version?: string;
    resources?: MongoClusterResources;
    access?: MongoAccess;
    addUsers?: MongoAddUser[];
    labels?: LabelsInterface;
}

export interface MongoPasswordOutput{
    clusterId: string;
    name: string;
    password: string;
}

export interface MongoPasswordsOutputMap{
    [key: string] : MongoPasswordOutput
}

export interface MongoHostOutput{
    type: string;
    value: string;
    role: string;
}

export interface MongoHostsOutputMap{
    [key: string] : MongoHostOutput
}