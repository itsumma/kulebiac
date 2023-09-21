import {LabelsInterface} from "../../labels";

export interface InstanceGroupDeployPolicy{
    maxUnavailable?: number;
    maxExpansion?: number;
    maxDeleting?: number;
    maxCreating?: number;
    startupDuration?: number;
    strategy?: string;
}

export interface InstanceGroupScalePolicy{
    autoScaleMode: boolean;

    size?: number;
    initialSize?: number;
    measurementDuration?: number;
    cpuUtilizationTarget?: number;
    minZoneSize?: number;
    maxSize?: number;
    warmupDuration?: number;
    stabilizationDuration?: number;
}

export interface InstanceGroupInstanceTemplateResources{
    cores?: number;
    memory?: number;
    coreFraction?: number;
}

export interface InstanceGroupInstanceTemplateDisk{
    imageId?: string;
    snapshotId?: string;
    mode?: string;
    size?: number;
    type?: string;
}

export interface InstanceGroupInstanceTemplate{
    name: string;
    hostName: string;
    bootDisk: InstanceGroupInstanceTemplateDisk;

    secondaryDisks?: InstanceGroupInstanceTemplateDisk[];
    resources?: InstanceGroupInstanceTemplateResources;
    platformId?: string;
    preemptible?: boolean;
    userData?: string;
}

export interface InstanceGroupHealthCheck{
    type: string;
    port: number;

    interval?: number;
    timeout?: number;
    healthyThreshold?: number;
    unhealthyThreshold?: number;
    path?: string;
}



export interface InstanceGroupLBTargetGroup{
    enabled: boolean;

    name?: string;
    description?: string;
    maxOpeningTrafficDuration?: number;
}

export interface InstanceGroup{
    name: string;
    network: string;
    subnet: string;
    sa: string;
    scalePolicy: InstanceGroupScalePolicy;
    instanceTemplate: InstanceGroupInstanceTemplate;

    isPublic?: boolean;
    lbTargetGroup?: InstanceGroupLBTargetGroup;
    deployPolicy?: InstanceGroupDeployPolicy;
    healthCheck?: InstanceGroupHealthCheck;
    labels?: LabelsInterface;
}