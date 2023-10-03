import {DBCluster, DBClustersOutputMap} from "./db";

export interface PostgresDatabase{
    dbName: string;
    userName: string;

    connLimit?: number;
    extensions?: string[];
}

export interface PostgresCluster extends DBCluster{
    databases?: PostgresDatabase[];
}

export interface PostgresClustersOutputMap extends DBClustersOutputMap{}

export interface PostgresUserOutput{
    userName: string;
    password: string;
}
export interface PostgresUsersOutputMap{
    [key: string]: PostgresUserOutput;
}