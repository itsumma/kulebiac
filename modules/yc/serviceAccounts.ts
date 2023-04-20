import {Construct} from "constructs";
import {IamServiceAccount} from "../../.gen/providers/yandex/iam-service-account";
import {ResourcemanagerFolderIamMember} from "../../.gen/providers/yandex/resourcemanager-folder-iam-member";

import {
    ServiceAccount as ServiceAccountInterface, ServiceAccountAccKeysOutputMap, ServiceAccountApiKeysOutputMap,
    ServiceAccountSaKeysOutputMap
} from "../../core/interfaces/yc/serviceAccounts"

import {IamServiceAccountStaticAccessKey} from "../../.gen/providers/yandex/iam-service-account-static-access-key";
import {IamServiceAccountKey} from "../../.gen/providers/yandex/iam-service-account-key";
import {IamServiceAccountApiKey} from "../../.gen/providers/yandex/iam-service-account-api-key";
import {TerraformOutput} from "cdktf";
import {
    StoreAccountKeys,
    StoreApiKeys,
    StoreFolderRoles,
    StoreServiceAccounts,
    StoreStaticAccessKeys
} from "../../core/interfaces/yc/store";

export class ServiceAccounts extends Construct{

    public serviceAccounts: StoreServiceAccounts = {};
    public folderRoles: StoreFolderRoles = {};
    public staticAccessKeys: StoreStaticAccessKeys = {};
    public accountKeys: StoreAccountKeys = {};
    public apiKeys: StoreApiKeys = {};

    constructor(
        scope: Construct,
        name: string,
        serviceAccounts: ServiceAccountInterface[],
        folderId: string
    ) {
        super(scope, name);

        serviceAccounts.forEach((item: ServiceAccountInterface) => {
            const _saId = item.name;
            const sa = new IamServiceAccount(
                scope, _saId, {
                    name: item.name,
                    description: item.description
                }
            );

            item.folderRoles.forEach(role => {
                const _roleId = item.name + '__' + role;
                this.folderRoles[_roleId] = new ResourcemanagerFolderIamMember(
                    scope,
                    _roleId,
                    {
                        folderId: folderId,
                        role: role,
                        member: `serviceAccount:${sa.id}`,
                        dependsOn: [sa]
                    }
                );
            });

            if (item.createStaticAccessKey){
                const _accessKeyId = `${item.name}__access_key`;
                this.staticAccessKeys[_accessKeyId] = new IamServiceAccountStaticAccessKey(
                    scope, _accessKeyId, {
                        serviceAccountId: sa.id,
                        description: `static access key for ${item.name}`,
                        dependsOn: [sa]
                    }
                )
            }

            if(item.createAccountKey){
                const _accKey = `${item.name}__account_key`;
                this.accountKeys[_accKey] = new IamServiceAccountKey(
                    scope, _accKey, {
                        serviceAccountId: sa.id,
                        description: `account key for ${item.name}`,
                        dependsOn: [sa]
                    }
                )
            }

            if(item.createIamApiKey){
                const _apiKey = `${item.name}__api_key`;
                this.apiKeys[_apiKey] = new IamServiceAccountApiKey(
                    scope, _apiKey, {
                        serviceAccountId: sa.id,
                        description: `api key for ${item.name}`,
                        dependsOn: [sa]
                    }
                )
            }

            this.serviceAccounts[_saId] = sa;
        })

        const saKeysOutput : ServiceAccountSaKeysOutputMap = {};
        for(const key in this.staticAccessKeys){
            saKeysOutput[key] = {
                access_key: this.staticAccessKeys[key].accessKey,
                secret_key: this.staticAccessKeys[key].secretKey
            }
        }
        new TerraformOutput(scope, `sa_keys`, {
            value: saKeysOutput,
            sensitive: true
        })

        const accKeysOutput: ServiceAccountAccKeysOutputMap = {};
        for(const key in this.accountKeys){
            const _val = this.accountKeys[key];
            accKeysOutput[key] = {
                id: _val.id,
                service_account_id: _val.serviceAccountId,
                created_at: _val.createdAt,
                key_algorithm: _val.keyAlgorithm,
                public_key: _val.publicKey,
                private_key: _val.privateKey
            }
        }
        new TerraformOutput(scope, 'account_keys', {
            value: accKeysOutput,
            sensitive: true
        })

        const apiKeysOutput: ServiceAccountApiKeysOutputMap = {};
        for(const key in this.apiKeys){
            const _val = this.apiKeys[key];
            apiKeysOutput[key] = {
                id: _val.id,
                secret: _val.secretKey,
                service_account_id: _val.serviceAccountId,
                created_at: _val.createdAt
            }
        }
        new TerraformOutput(scope, 'iam_api_keys', {
            value: apiKeysOutput,
            sensitive: true
        })
    }
}