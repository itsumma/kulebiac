import {LabelsInterface} from "../../labels";

export interface ClickHouseHost{
    subnet: string;

    isPublic?: boolean;
}

export interface ClickHouseResources{
    resourcePresetId?: string;
    diskTypeId?: string;
    diskSize?: number;
}

export interface ClickHouseAccess{
    webSql?: boolean;
    dataLens?: boolean;
    metrika?: boolean;
    serverless?: boolean;
    yandexQuery?: boolean;
    dataTransfer?: boolean;
}

export interface ClickHouseDatabase{
    dbName: string;
    userName: string;
}

export interface ClickHouseAddUser{
    userName: string;
    databases: string[];
}

export interface ClickHouseCluster{
    name: string;
    network: string;
    host: ClickHouseHost;
    databases: ClickHouseDatabase[];

    version?: string;
    environment?: string;
    resources?: ClickHouseResources;
    access?: ClickHouseAccess;
    addUsers?: ClickHouseAddUser[];
    labels?: LabelsInterface;
}

export interface ClickHousePasswordOutput{
    clusterId: string;
    name: string;
    password: string;
}

export interface ClickHousePasswordsOutputMap{
    [key: string] : ClickHousePasswordOutput;
}

export interface ClickHouseHostOutput{
    type: string;
    value: string;
}

export interface ClickHouseHostsOutputMap{
    [key: string] : ClickHouseHostOutput
}