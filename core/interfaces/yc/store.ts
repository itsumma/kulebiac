import {IamServiceAccount} from "../../../.gen/providers/yandex/iam-service-account";
import {ResourcemanagerFolderIamMember} from "../../../.gen/providers/yandex/resourcemanager-folder-iam-member";
import {IamServiceAccountStaticAccessKey} from "../../../.gen/providers/yandex/iam-service-account-static-access-key";
import {IamServiceAccountKey} from "../../../.gen/providers/yandex/iam-service-account-key";
import {IamServiceAccountApiKey} from "../../../.gen/providers/yandex/iam-service-account-api-key";
import {StorageBucket} from "../../../.gen/providers/yandex/storage-bucket";
import {VpcAddress} from "../../../.gen/providers/yandex/vpc-address";
import {VpcNetwork} from "../../../.gen/providers/yandex/vpc-network";
import {VpcSubnet} from "../../../.gen/providers/yandex/vpc-subnet";
import {ComputeInstance} from "../../../.gen/providers/yandex/compute-instance";
import {KubernetesCluster} from "../../../.gen/providers/yandex/kubernetes-cluster";
import {KubernetesNodeGroup} from "../../../.gen/providers/yandex/kubernetes-node-group";
import {ContainerRegistry} from "../../../.gen/providers/yandex/container-registry";
import {MdbPostgresqlCluster} from "../../../.gen/providers/yandex/mdb-postgresql-cluster";
import {MdbPostgresqlUser} from "../../../.gen/providers/yandex/mdb-postgresql-user";
import {MdbPostgresqlDatabase} from "../../../.gen/providers/yandex/mdb-postgresql-database";
import {MdbElasticsearchCluster} from "../../../.gen/providers/yandex/mdb-elasticsearch-cluster";
import {MdbMysqlCluster} from "../../../.gen/providers/yandex/mdb-mysql-cluster";
import {MdbMysqlDatabase} from "../../../.gen/providers/yandex/mdb-mysql-database";
import {MdbMysqlUser} from "../../../.gen/providers/yandex/mdb-mysql-user";
import {MdbMongodbCluster} from "../../../.gen/providers/yandex/mdb-mongodb-cluster";
import {MdbClickhouseCluster} from "../../../.gen/providers/yandex/mdb-clickhouse-cluster";
import {MdbRedisCluster} from "../../../.gen/providers/yandex/mdb-redis-cluster";
import {KmsSymmetricKey} from "../../../.gen/providers/yandex/kms-symmetric-key";
import {LockboxSecret} from "../../../.gen/providers/yandex/lockbox-secret";
import {ComputeInstanceGroup} from "../../../.gen/providers/yandex/compute-instance-group";
import {LbNetworkLoadBalancer} from "../../../.gen/providers/yandex/lb-network-load-balancer";

export interface StoreServiceAccounts{
    [key: string] : IamServiceAccount
}

export interface StoreFolderRoles{
    [key: string] : ResourcemanagerFolderIamMember
}

export interface StoreStaticAccessKeys{
    [key: string] : IamServiceAccountStaticAccessKey
}

export interface StoreAccountKeys{
    [key: string]: IamServiceAccountKey
}

export interface StoreApiKeys{
    [key: string]: IamServiceAccountApiKey
}

export interface StoreBuckets {
    [key: string] : StorageBucket
}

export interface StoreStaticIps{
    [key: string] : VpcAddress
}

export interface StoreVpcs{
    [key: string] : VpcNetwork
}

export interface StoreSubnets{
    [key: string] : VpcSubnet
}

export interface StoreInstances{
    [key: string]: ComputeInstance
}

export interface StoreKubernetesClusters{
    [key: string] : KubernetesCluster
}

export interface StoreKubernetesWorkerGroups{
    [key: string] : KubernetesNodeGroup
}

export interface StoreRegistries{
    [key: string] : ContainerRegistry
}

export interface StorePostgresClusters{
    [key: string] : MdbPostgresqlCluster
}

export interface StorePostgresUser{
    [key: string] : MdbPostgresqlUser
}

export interface StorePostgresDatabases{
    [key: string] : MdbPostgresqlDatabase
}

export interface StoreMysqlClusters{
    [key: string] : MdbMysqlCluster
}
export interface StoreMysqlDatabases{
    [key: string] : MdbMysqlDatabase;
}
export interface StoreMysqlUsers{
    [key: string]: MdbMysqlUser
}

export interface StoreMongoClusters{
    [key: string] : MdbMongodbCluster
}

export interface StoreClickHouseClusters{
    [key: string] : MdbClickhouseCluster
}

export interface StoreRedisClusters{
    [key: string] : MdbRedisCluster
}

export interface StoreKmsKeys{
    [key: string] : KmsSymmetricKey
}

export interface StoreLockBoxSecret{
    [key: string]: LockboxSecret
}

export interface StoreInstanceGroups{
    [key: string] : ComputeInstanceGroup
}

export interface StoreNetworkLoadBalancers{
    [key: string] : LbNetworkLoadBalancer
}