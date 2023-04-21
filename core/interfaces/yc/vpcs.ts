// VPC module
export interface Subnet{
    name: string;
    subnet: string;
    zone: string;
}

export interface StaticRoute{
    name: string;
    destination: string;
    next: string;
}

export interface NatDataParams{
    name: string;
    imageId: string;
    userDataKey: string;
    subnetKey: string;

    bootDiskSize?: number;
    cores?: number;
    memory?: number;
    coreFraction?: number;
    staticIpKey?: string;
}

export interface NatData{
    enabled: boolean;
    params?: NatDataParams;
}

export interface Vpc{
    name: string;
    publicSubnets: Subnet[];
    infraSubnets: Subnet[];
    addStaticRoutes: StaticRoute[];
    natData: NatData
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