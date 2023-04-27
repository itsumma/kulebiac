// InstancesModule
export interface InstanceResources{
    cores? : number;
    memory? : number;
    coreFraction? : number;
}

export interface Instance {
    // required
    name: string;
    imageId: string;
    subnetId: string;
    isPublic: boolean;
    zone: string;

    // optional
    bootDiskSize?: number;
    userData?: string;
    resources? : InstanceResources;
    securityGroup?: string;
    publicStaticIp? : string;
    allowStoppingForUpdate?: boolean;
    platformId? : string;
}