// VPC module
import {LabelsInterface} from "../../labels";

export interface Subnet{
    name: string;
    subnet: string;
    zone: string;

    labels?: LabelsInterface;
}

export interface StaticRoute{
    destination: string;
    next: string;
}

export interface NatDataParams{
    name: string;
    imageId: string;
    subnet: string;

    userData?: string;
    bootDiskSize?: number;
    bootDiskType?: string;
    platformId?: string;
    allowStoppingForUpdate?: boolean;
    cores?: number;
    memory?: number;
    coreFraction?: number;
    staticIp?: string;
    labels?: LabelsInterface;
}

export interface NatData{
    enabled: boolean;
    params?: NatDataParams;
}

export interface Vpc{
    name: string;
    publicSubnets: Subnet[];
    infraSubnets: Subnet[];
    natData: NatData;

    addStaticRoutes?: StaticRoute[];
    labels?: LabelsInterface;
}


export interface VpcsOutput{
    networkId: string;
}
export interface VpcsOutputMap{
    [key:string] : VpcsOutput
}

export interface SubnetsOutput{
    subnetId: string;
    zone: string;
    networkId: string;
}
export interface SubnetsOutputMap{
    [key: string]: SubnetsOutput
}