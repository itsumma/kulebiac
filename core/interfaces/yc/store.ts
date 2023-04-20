import {IamServiceAccount} from "../../../.gen/providers/yandex/iam-service-account";
import {ResourcemanagerFolderIamMember} from "../../../.gen/providers/yandex/resourcemanager-folder-iam-member";
import {IamServiceAccountStaticAccessKey} from "../../../.gen/providers/yandex/iam-service-account-static-access-key";
import {IamServiceAccountKey} from "../../../.gen/providers/yandex/iam-service-account-key";
import {IamServiceAccountApiKey} from "../../../.gen/providers/yandex/iam-service-account-api-key";
import {StorageBucket} from "../../../.gen/providers/yandex/storage-bucket";
import {ContainerRegistry} from "../../../.gen/providers/yandex/container-registry";
import {VpcAddress} from "../../../.gen/providers/yandex/vpc-address";

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

export interface StoreRegistries{
    [key: string] : ContainerRegistry
}