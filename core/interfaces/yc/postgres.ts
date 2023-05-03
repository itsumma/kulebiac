// Postgres module
import {LabelsInterface} from "../../labels";

export interface PostgresClusterResources{
    resourcePreset: string;
    diskSize: number;
    diskType: string
}

export interface PostgresExtension{
    name: string
}

export interface PostgresDatabase{
    userName: string;
    dbName: string;

    connLimit? : number;
    userGrants?: string[];
    extensions?: PostgresExtension[];
}

export interface PostgresAddUser{
    name: string;

    connLimit?: number;
    databasesAccess?: string[];
    grants?: string[];
}

export interface PostgresCluster{
    name: string;
    network: string;
    version: string;
    environment: string;
    resources: PostgresClusterResources;
    subnet: string;
    databases: PostgresDatabase[];
    addUsers: PostgresAddUser[];

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
    type: string;
    value: string;
}
export interface PostgresHostOutputMap{
    [key: string] : PostgresHostOutput
}