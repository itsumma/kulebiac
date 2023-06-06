// InstancesModule
import {LabelsInterface} from "../../labels";

export interface InstanceResources{
    cores? : number;
    memory? : number;
    coreFraction? : number;
}

export interface Instance {
    // required
    name: string;
    imageId: string;
    network: string;
    subnet: string;


    // optional
    isPublic?: boolean;
    userData?: string;
    bootDiskSize?: number;
    bootDiskType?: string;
    resources? : InstanceResources;
    securityGroup?: string;
    staticIp? : string;
    allowStoppingForUpdate?: boolean;
    platformId? : string;
    labels?: LabelsInterface;
}

export interface InstancesOutput{
    privateIp: string;
    fqdn: string;

    publicIp?: string;
}

export interface InstancesOutputMap{
    [key: string] : InstancesOutput;
}