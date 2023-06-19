import {LabelsInterface} from "../../labels";
import {getBindingIdentifiers} from "@babel/types";
import keys = getBindingIdentifiers.keys;

export interface MysqlDatabase{
    userName: string;
    dbName: string;

    connLimit?: number;
}
export interface MysqlAddUserDatabaseAccess{
    dbName: string;
    roles: string[];
}
export interface MysqlAddUser{
    name: string;
    databasesAccess: MysqlAddUserDatabaseAccess[];

    connLimit?: number;
}
export interface MysqlClusterResources{
    resourcePresetId?: string;
    diskSize?: number;
    diskTypeId: string;
}
export interface MysqlAccess{
    dataLens? :boolean;
    dataTransfer?: boolean;
    webSql?: boolean;
}
export interface MysqlHost{
    subnet: string;

    isPublic?: boolean;
}
export interface MysqlCluster{
    name: string;
    network: string;
    host: MysqlHost;
    databases: MysqlDatabase[];

    version?: string;
    environment?: string;
    resources?: MysqlClusterResources;
    access?: MysqlAccess;
    addUsers?: MysqlAddUser[];
    labels?: LabelsInterface;
}

export interface MysqlPasswordsOutput{
    clusterId: string;
    name: string;
    password: string;
}
export interface MysqlPasswordsOutputMap{
    [key: string] : MysqlPasswordsOutput
}

export interface MysqlHostOutput{
    type: string;
    value: string;
}
export interface MysqlHostOutputMap{
    [key: string] : MysqlHostOutput
}