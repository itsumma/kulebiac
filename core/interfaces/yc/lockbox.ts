import {LabelsInterface} from "../../labels";

export interface LockboxSecretData{
    [key: string] : string;
}

export interface LockboxSecret{
    name: string;
    kms: string;
    sa: string;
    data: LockboxSecretData;

    description?: string;
    labels?: LabelsInterface;
}

export interface LockboxSecretOutput{
    name: string;
    id: string;
    status: string;
}

export interface LockboxSecretsOutputMap{
    [key: string]: LockboxSecretOutput
}