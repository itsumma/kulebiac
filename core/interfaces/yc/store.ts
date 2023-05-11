import {IamServiceAccount} from "../../../.gen/providers/yandex/iam-service-account";
import {ResourcemanagerFolderIamMember} from "../../../.gen/providers/yandex/resourcemanager-folder-iam-member";
import {IamServiceAccountStaticAccessKey} from "../../../.gen/providers/yandex/iam-service-account-static-access-key";
import {IamServiceAccountKey} from "../../../.gen/providers/yandex/iam-service-account-key";
import {IamServiceAccountApiKey} from "../../../.gen/providers/yandex/iam-service-account-api-key";
import {StorageBucket} from "../../../.gen/providers/yandex/storage-bucket";
import {ContainerRegistry} from "../../../.gen/providers/yandex/container-registry";
import {VpcAddress} from "../../../.gen/providers/yandex/vpc-address";
import {VpcNetwork} from "../../../.gen/providers/yandex/vpc-network";
import {ComputeInstance} from "../../../.gen/providers/yandex/compute-instance";
import {VpcSubnet} from "../../../.gen/providers/yandex/vpc-subnet";
import {MdbPostgresqlCluster} from "../../../.gen/providers/yandex/mdb-postgresql-cluster";
import {MdbPostgresqlUser} from "../../../.gen/providers/yandex/mdb-postgresql-user";
import {MdbPostgresqlDatabase} from "../../../.gen/providers/yandex/mdb-postgresql-database";
import {KubernetesCluster} from "../../../.gen/providers/yandex/kubernetes-cluster";
import {KubernetesNodeGroup} from "../../../.gen/providers/yandex/kubernetes-node-group";
import {MdbElasticsearchCluster} from "../../../.gen/providers/yandex/mdb-elasticsearch-cluster";

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

export interface StoreRegistries{
    [key: string] : ContainerRegistry
}

export interface StoreKubernetesClusters{
    [key: string] : KubernetesCluster
}

export interface StoreKubernetesWorkerGroups{
    [key: string] : KubernetesNodeGroup
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

export interface StoreElasticSearchCluster{
    [key: string] : MdbElasticsearchCluster
}