// Registry module
import {LabelsInterface} from "../../labels";

export interface RegistrySA{
    name: string;
    folderId?: string;
}

export interface Registry{
    name: string;

    allowedPushIps?: string[];
    allowedPullIps?: string[];
    allowedPushSa?: RegistrySA[];
    allowedPullSa?: RegistrySA[];
    labels?: LabelsInterface;
}

export interface RegistryOutput{
    name: string;
    id: string;
}

export interface RegistriesOutputMap{
    [key: string] : RegistryOutput;
}