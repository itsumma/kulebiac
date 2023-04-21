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
    userDataKey: string;
    subnetId: string;

    // optional
    bootDiskSize?: number;
    resources? : InstanceResources;
    isPublic: boolean;
    zone: string;
    securityGroup?: string;
    publicStaticIp? : string;
    allowStoppingForUpdate?: boolean;
    platformId? : string;
}