import {LabelsInterface} from "../../labels";

export interface NetworkLoadBalancerListenerExternalAddress{
    address?: string;
    ipVersion?: string;
}

export interface NetworkLoadBalancerListenerInternalAddress{
    network: string;
    subnet: string;
    address?: string;
    ipVersion?: string;
}

export interface NetworkLoadBalancerListener{
    name: string;
    port: number;

    targetPort?: number;
    protocol?: string;
    internalAddress?: NetworkLoadBalancerListenerInternalAddress;
    externalAddress?: NetworkLoadBalancerListenerExternalAddress;
}

export interface NetworkLoadBalancerTargetGroupHealthCheck{
    type: string;
    port: number;

    interval?: number;
    timeout?: number;
    healthyThreshold?: number;
    unhealthyThreshold?: number;
    path?: string;
}

export interface NetworkLoadBalancerTargetGroupRef{
    resourceType: string;
    resourceName: string;

    healthCheck: NetworkLoadBalancerTargetGroupHealthCheck;
}

export interface NetworkLoadBalancer{
    name: string;
    type: string;
    listeners: NetworkLoadBalancerListener[];
    targetGroupRef: NetworkLoadBalancerTargetGroupRef;

    labels?: LabelsInterface;
}