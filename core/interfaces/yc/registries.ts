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