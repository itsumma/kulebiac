import {BaseStackConfig} from "../../stackConfig";
import {BackendConfiguration} from "./backend";
import {ServiceAccount} from "./serviceAccounts";
import {Bucket} from "./buckets";
import {Registry} from "./registries";
import {StaticIp} from "./staticIps";
import {Vpc} from "./vpcs";
import {Kubernetes} from "./k8s";
import {PostgresCluster} from "./postgres";
import {ElasticSearchCluster} from "./elasticSearch";
import {Instance} from "./instances";

export interface YandexStackConfig extends BaseStackConfig{
    cloudId: string;
    folderId: string;
    token: string;
    backendConfiguration: BackendConfiguration;

    serviceAccounts?: ServiceAccount[];
    buckets?: Bucket[];
    staticIps?: StaticIp[];
    vpcs?: Vpc[];
    publicInstances?: Instance[];
    privateInstances?: Instance[];
    registries?: Registry[];
    k8sClusters?: Kubernetes[];
    pgClusters?: PostgresCluster[];
    elasticSearchClusters?: ElasticSearchCluster[];
}