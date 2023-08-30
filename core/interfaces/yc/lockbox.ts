import {LabelsInterface} from "../../labels";

export interface LockboxDbSecretTargetRef{
    type: string;
    clusterName: string;

    userName?: string;
}

export interface LockboxSecretData{
    [key: string] : string | LockboxDbSecretTargetRef;
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