import {BaseStackConfig} from "../../stackConfig";
import {BackendConfiguration} from "./backend";
import {ServiceAccount} from "./serviceAccounts";
import {Bucket} from "./buckets";
import {Registry} from "./registries";
import {StaticIp} from "./staticIps";
import {Vpc} from "./vpcs";
import {Kubernetes} from "./k8s";
import {PostgresCluster} from "./postgres";
import {Instance} from "./instances";
import {MysqlCluster} from "./mysql";
import {MongoCluster} from "./mongo";
import {ClickHouseCluster} from "./clickHouse";
import {RedisCluster} from "./redis";
import {Kms} from "./kms";
import {LockboxSecret} from "./lockbox";
import {InstanceGroup} from "./instanceGroup";
import {NetworkLoadBalancer} from "./networkLoadBalancer";

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
    instanceGroups?: InstanceGroup[];
    registries?: Registry[];
    k8sClusters?: Kubernetes[];
    pgClusters?: PostgresCluster[];
    mysqlClusters?: MysqlCluster[];
    mongoClusters?: MongoCluster[];
    clickHouseClusters?: ClickHouseCluster[];
    redisClusters?: RedisCluster[];
    kmsKeys?: Kms[];
    lockboxSecrets?: LockboxSecret[];
    networkLoadBalancers?: NetworkLoadBalancer[];
}