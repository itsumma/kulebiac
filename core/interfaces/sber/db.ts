import {LabelsInterface} from "../../labels";

export interface DBClusterVolume{
    type?: string;
    size?: number;
}

export interface DBClusterBackupStrategy{
    startTime?: string;
    keepDays?: number;
}

export interface DBCluster{
    name: string;
    network: string;
    subnet: string;
    secGroup: string;

    availabilityZone?: string;
    flavorId?: string;
    version?: string;
    rootPassword?: string;
    volume?: DBClusterVolume;
    backupStrategy?: DBClusterBackupStrategy;
    elasticIp?: string;
    labels?: LabelsInterface;
}

export interface DBClusterOutput{
    clusterId: string;
    password: string;
    privateIps: string[];
    publicIps: string[];
}

export interface DBClustersOutputMap{
    [key: string] : DBClusterOutput
}