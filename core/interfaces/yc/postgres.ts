// Postgres module
import {LabelsInterface} from "../../labels";

export interface PostgresClusterResources{
    resourcePresetId: string;
    diskSize: number;
    diskTypeId: string
}

export interface PostgresDatabase{
    userName: string;
    dbName: string;

    connLimit? : number;
    userGrants?: string[];
    extensions?: string[];
}

export interface PostgresAddUser{
    name: string;

    connLimit?: number;
    databasesAccess?: string[];
    grants?: string[];
}

export interface PostgresHost{
    subnet: string

    isPublic? : boolean;
}

export interface PostgresAccessConfig{
    dataLens?: boolean;
    webSql?: boolean;
    dataTransfer?: boolean;
    serverless?: boolean;
}

export interface PostgresCluster{
    name: string;
    network: string;
    host: PostgresHost;
    databases: PostgresDatabase[];

    resources?: PostgresClusterResources;
    access?: PostgresAccessConfig;
    addUsers?: PostgresAddUser[];
    version?: string;
    environment?: string;
    labels?: LabelsInterface;
}


export interface PostgresPasswordsOutput{
    clusterId: string;
    name: string;
    password: string;
}
export interface PostgresPasswordsOutputMap{
    [key: string] : PostgresPasswordsOutput
}

export interface PostgresHostOutput{
    value: string;
}
export interface PostgresHostOutputMap{
    [key: string] : PostgresHostOutput
}