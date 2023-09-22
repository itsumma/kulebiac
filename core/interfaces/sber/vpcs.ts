import {LabelsInterface} from "../../labels";

export interface Subnet{
    name: string;
    cidr: string;
    gatewayIp: string;

    primaryDns?: string;
    secondaryDns?: string;
    labels?: LabelsInterface;
}

export interface VpcNatConfig{
    enabled: boolean;
    elasticIp: string;

    spec?: string;
}

export interface Vpc{
    name: string;
    cidr: string;
    publicSubnet: Subnet;
    internalSubnet: Subnet;

    nat?: VpcNatConfig;
    labels?: LabelsInterface;
}