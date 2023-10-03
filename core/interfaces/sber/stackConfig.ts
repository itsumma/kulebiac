import {BaseStackConfig} from "../../stackConfig";
import {BackendConfiguration} from "./backend";
import {StaticIpConfig} from "./staticIp";
import {Vpc} from "./vpcs";
import {KubernetesCluster} from "./k8s";
import {KeyPair} from "./keyPair";
import {Registry} from "./registry";
import {IamUser} from "./iamUser";
import {Bucket} from "./bucket";
import {SecGroup} from "./secGroup";
import {PostgresCluster} from "./postgres";

export interface SbercloudStackConfig extends BaseStackConfig{
    accessKey: string;
    secretKey: string;
    projectId: string;
    backendConfiguration: BackendConfiguration;

    iamUsers?: IamUser[];
    registries?: Registry[];
    buckets?: Bucket[];
    staticIpConfig?: StaticIpConfig;
    keyPairs?: KeyPair[];
    vpcs?: Vpc[];
    secGroups?: SecGroup[];
    k8sClusters?: KubernetesCluster[];
    pgClusters?: PostgresCluster[];
}