import {Construct} from "constructs";
import {Registry, RegistryImage, RegistryUser} from "../../core/interfaces/sber/registry";
import {SwrOrganization} from "../../.gen/providers/sbercloud/swr-organization";
import {SwrRepository} from "../../.gen/providers/sbercloud/swr-repository";
import {StoreIamUsers} from "../../core/interfaces/sber/store";
import {SwrOrganizationPermissions} from "../../.gen/providers/sbercloud/swr-organization-permissions";

export class Registries extends Construct{
    private readonly iamUsers: StoreIamUsers = {};
    constructor(
        scope: Construct,
        name: string,
        registries: Registry[],
        iamUsers: StoreIamUsers = {}
    ) {
        super(scope, name);

        this.iamUsers = iamUsers;

        const __defaults = {
            isPublic: false,
            category: "other",
            role: "Read"
        }

        registries.forEach((item: Registry) => {
            const _rId = item.name;

            const organization = new SwrOrganization(scope, _rId, {
                name: item.name
            });

            if(item.images){
                item.images.forEach((image: RegistryImage) => {
                    const _imId = `${_rId}__${image.name}`;

                    new SwrRepository(scope, _imId, {
                        organization: organization.name,
                        name: image.name,
                        isPublic: image.isPublic ? image.isPublic : __defaults.isPublic,
                        category: image.category ? image.category : __defaults.category
                    })
                })
            }

            if(item.users){
                const _pId = `${_rId}__permission`;

                new SwrOrganizationPermissions(scope, _pId, {
                    organization: organization.name,

                    users: item.users.map((user: RegistryUser) => {
                        return {
                            userId: this.iamUsers[user.name].id,
                            userName: this.iamUsers[user.name].name,
                            permission: user.role ? user.role: __defaults.role
                        }
                    })
                })
            }
        });
    }
}