import {LabelsInterface} from "../../labels";

export interface LockboxSecretTargetRef{
    type: string;

    clusterName?: string;
    userName?: string;
    sa?: string;
}

export interface LockboxSecretData{
    [key: string] : string | LockboxSecretTargetRef;
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