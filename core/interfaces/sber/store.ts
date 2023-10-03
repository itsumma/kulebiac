import {VpcBandwidth} from "../../../.gen/providers/sbercloud/vpc-bandwidth";
import {VpcEip} from "../../../.gen/providers/sbercloud/vpc-eip";
import {Vpc} from "../../../.gen/providers/sbercloud/vpc";
import {VpcSubnet} from "../../../.gen/providers/sbercloud/vpc-subnet";
import {CceCluster} from "../../../.gen/providers/sbercloud/cce-cluster";
import {CceNodePool} from "../../../.gen/providers/sbercloud/cce-node-pool";
import {ComputeKeypair} from "../../../.gen/providers/sbercloud/compute-keypair";
import {IdentityUser} from "../../../.gen/providers/sbercloud/identity-user";
import {IdentityAccessKey} from "../../../.gen/providers/sbercloud/identity-access-key";
import {DataSbercloudIdentityRole} from "../../../.gen/providers/sbercloud/data-sbercloud-identity-role";
import {ObsBucket} from "../../../.gen/providers/sbercloud/obs-bucket";
import {NetworkingSecgroup} from "../../../.gen/providers/sbercloud/networking-secgroup";
import {RdsInstance} from "../../../.gen/providers/sbercloud/rds-instance";
import {Role} from "@cdktf/provider-postgresql/lib/role";

export interface StoreShareBandWidths{
    [key: string]: VpcBandwidth;
}

export interface StoreElasticIps{
    [key: string]: VpcEip;
}

export interface StoreVpcs{
    [key: string]: Vpc;
}

export interface StoreSubnets{
    [key: string]: VpcSubnet;
}

export interface StoreKubernetesClusters{
    [key: string]: CceCluster;
}

export interface StoreKubernetesNodeGroups{
    [key: string]: CceNodePool;
}

export interface StoreKeyPairs{
    [key: string]: ComputeKeypair
}

export interface StoreIamUsers{
    [key: string]: IdentityUser
}

export interface StoreIamAccessKeys{
    [key: string]: IdentityAccessKey
}

export interface StoreDSIamRoles{
    [key: string]: DataSbercloudIdentityRole
}

export interface StoreBuckets{
    [key: string]: ObsBucket
}

export interface StoreSecGroups{
    [key: string]: NetworkingSecgroup;
}

export interface StorePostgresClusters{
    [key: string]: RdsInstance
}

export interface StorePgUsers{
    [key: string]: Role
}