import {BaseStackConfig} from "../../stackConfig";
import {BackendConfiguration} from "./backend";
import {StaticIpConfig} from "./staticIp";
import {Vpc} from "./vpcs";
import {KubernetesCluster} from "./k8s";
import {KeyPair} from "./keyPair";

export interface SbercloudStackConfig extends BaseStackConfig{
    accessKey: string;
    secretKey: string;
    backendConfiguration: BackendConfiguration;

    staticIpConfig?: StaticIpConfig;
    keyPairs?: KeyPair[];
    vpcs?: Vpc[];
    k8sClusters?: KubernetesCluster[];
}