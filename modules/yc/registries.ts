import {Construct} from "constructs";
import {ContainerRegistry} from "../../.gen/providers/yandex/container-registry";
import {StoreRegistries, StoreServiceAccounts} from "../../core/interfaces/yc/store";
import {RegistriesOutputMap, Registry, RegistrySA} from "../../core/interfaces/yc/registries";
import {LabelsInterface} from "../../core/labels";
import {ContainerRegistryIpPermission} from "../../.gen/providers/yandex/container-registry-ip-permission";
import {DataYandexIamServiceAccount} from "../../.gen/providers/yandex/data-yandex-iam-service-account";
import {ContainerRegistryIamBinding} from "../../.gen/providers/yandex/container-registry-iam-binding";
import {TerraformOutput} from "cdktf";

export class Registries extends Construct{
    public registries : StoreRegistries = {};

    private readonly serviceAccounts : StoreServiceAccounts = {};

    constructor(
        scope: Construct,
        name: string,
        registries: Registry[],
        serviceAccounts: StoreServiceAccounts = {},
        defaultLabels: LabelsInterface = {}
    ) {
        super(scope, name);

        this.serviceAccounts = serviceAccounts;

        registries.forEach((item: Registry) => {
            const _rId = item.name;

            const _registryLabels = item.labels !== undefined ? item.labels : {};
            const registry = new ContainerRegistry(scope, _rId, {
                name: item.name,
                labels: {...defaultLabels, ..._registryLabels}
            })

            this.registries[_rId] = registry;

            if(
                item.allowedPullIps
                ||
                item.allowedPushIps
            ){
                new ContainerRegistryIpPermission(scope, `${_rId}-ip-permission`, {
                    registryId: registry.id,

                    pull: item.allowedPullIps,
                    push: item.allowedPushIps
                })
            }

            if(item.allowedPullSa){
                const __members : string[] = [];
                item.allowedPullSa.forEach((member:RegistrySA) => {
                    if(member.folderId){
                        const _extMember = new DataYandexIamServiceAccount(scope, `${member.name}--ext-iam-pull`, {
                            name: member.name,
                            folderId: member.folderId
                        });
                        __members.push(`serviceAccount:${_extMember.id}`);
                    }else{
                        __members.push(`serviceAccount:${this.serviceAccounts[member.name].id}`);
                    }
                })

                new ContainerRegistryIamBinding(scope, `${_rId}-iam-puller`, {
                    registryId: registry.id,
                    role: 'container-registry.images.puller',
                    members: __members
                });
            }

            if(item.allowedPushSa){
                const __members : string[] = [];
                item.allowedPushSa.forEach((member:RegistrySA) => {
                    if(member.folderId){
                        const _extMember = new DataYandexIamServiceAccount(scope, `${member.name}--ext-iam-push`, {
                            name: member.name,
                            folderId: member.folderId
                        });
                        __members.push(`serviceAccount:${_extMember.id}`);
                    }else{
                        __members.push(`serviceAccount:${this.serviceAccounts[member.name].id}`);
                    }
                })

                new ContainerRegistryIamBinding(scope, `${_rId}-iam-pusher`, {
                    registryId: registry.id,
                    role: 'container-registry.images.pusher',
                    members: __members
                });
            }
        });

        const registriesOutput: RegistriesOutputMap = {};
        for (const key in this.registries){
            const _val = this.registries[key];

            registriesOutput[key] = {
                name: _val.name,
                id: _val.id
            }
        }
        new TerraformOutput(scope, 'registries_data', {
            value: registriesOutput
        });
    }
}