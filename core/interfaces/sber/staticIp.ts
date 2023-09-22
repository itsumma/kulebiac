import {LabelsInterface} from "../../labels";

export interface SharedBandwidth{
    name: string;
    size?: number;
}

export interface StaticIp{
    name: string;
    bandwidthName: string;
    shareType: string;

    type?: string;
    chargeMode?: string;
    bandwidthSize?: number;
    labels?: LabelsInterface;
}

export interface StaticIpConfig{
    staticIps?: StaticIp[];
    shareBandwidths?: SharedBandwidth[];
}

export interface StaticIpOutput{
    ip: string;
}

export interface StaticIpsOutputMap{
    [key: string]: StaticIpOutput;
}