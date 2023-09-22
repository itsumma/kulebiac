import {VpcBandwidth} from "../../../.gen/providers/sbercloud/vpc-bandwidth";
import {VpcEip} from "../../../.gen/providers/sbercloud/vpc-eip";
import {Vpc} from "../../../.gen/providers/sbercloud/vpc";
import {VpcSubnet} from "../../../.gen/providers/sbercloud/vpc-subnet";
import {CceCluster} from "../../../.gen/providers/sbercloud/cce-cluster";
import {CceNodePool} from "../../../.gen/providers/sbercloud/cce-node-pool";
import {ComputeKeypair} from "../../../.gen/providers/sbercloud/compute-keypair";

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