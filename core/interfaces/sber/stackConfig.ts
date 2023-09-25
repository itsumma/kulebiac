import {BaseStackConfig} from "../../stackConfig";
import {BackendConfiguration} from "./backend";
import {StaticIpConfig} from "./staticIp";
import {Vpc} from "./vpcs";
import {KubernetesCluster} from "./k8s";
import {KeyPair} from "./keyPair";
import {IamUser} from "./iamUser";
import {Registry} from "./registry";
import {Bucket} from "./bucket";

export interface SbercloudStackConfig extends BaseStackConfig{
    accessKey: string;
    secretKey: string;
    backendConfiguration: BackendConfiguration;
    projectId: string;

    iamUsers?: IamUser[];
    registries?: Registry[];
    buckets?: Bucket[];
    staticIpConfig?: StaticIpConfig;
    keyPairs?: KeyPair[];
    vpcs?: Vpc[];
    k8sClusters?: KubernetesCluster[];
}