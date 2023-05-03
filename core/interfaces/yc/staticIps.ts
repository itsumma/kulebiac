// Static ip module
import {LabelsInterface} from "../../labels";

export interface StaticIp{
    name: string;
    zone: string;

    labels?: LabelsInterface;
}

export interface StaticIpsOutput{
    ip: string
}
export interface StaticIpsOutputMap{
    [key: string] : StaticIpsOutput
}
