import {Construct} from "constructs";
import {IamUser, IamUserAccessKeyOutput, IamUserAccessKeysOutputMap} from "../../core/interfaces/sber/iamUser";
import {StoreDSIamRoles, StoreIamAccessKeys, StoreIamUsers} from "../../core/interfaces/sber/store";
import {IdentityUser} from "../../.gen/providers/sbercloud/identity-user";
import {IdentityAccessKey} from "../../.gen/providers/sbercloud/identity-access-key";
import {TerraformOutput} from "cdktf";
import {IdentityGroup} from "../../.gen/providers/sbercloud/identity-group";
import {IdentityGroupMembership} from "../../.gen/providers/sbercloud/identity-group-membership";
import {DataSbercloudIdentityRole} from "../../.gen/providers/sbercloud/data-sbercloud-identity-role";
import {IdentityRoleAssignment} from "../../.gen/providers/sbercloud/identity-role-assignment";

export class IamUsers extends Construct{
    public iamUsers: StoreIamUsers = {};
    public accessKeys: StoreIamAccessKeys = {};

    private roles: StoreDSIamRoles = {};

    constructor(
        scope: Construct,
        name: string,
        iamUsers: IamUser[],
        projectId: string
    ) {
        super(scope, name);

        iamUsers.forEach((item: IamUser) => {
            const _uKey = item.name;

            const iamUser = new IdentityUser(scope, _uKey, {
                name: item.name,
                accessType: 'programmatic'
            });
            this.iamUsers[_uKey] = iamUser;

            if(item.createAccessKey){
                const _acKey = `${_uKey}--access-key`;
                this.accessKeys[_acKey] = new IdentityAccessKey(scope, `${_uKey}--access-key`, {
                    userId: iamUser.id,
                    secretFile: '/x/y/z'
                });
            }

            if(item.roles){
                const identityGroup = new IdentityGroup(scope, `${_uKey}--identity-group`, {
                    name: `${item.name}_identity_group`
                });

                new IdentityGroupMembership(scope, `${_uKey}--identity-group-membership`, {
                    group: identityGroup.id,
                    users: [
                        iamUser.id
                    ]
                });

                item.roles.forEach((role: string) => {
                    let __role : DataSbercloudIdentityRole;
                    if(!this.roles[role]){
                        __role = new DataSbercloudIdentityRole(scope, `${role}--role-ds`, {
                            displayName: role
                        });
                        this.roles[role] = __role;
                    }else{
                        __role = this.roles[role];
                    }

                    new IdentityRoleAssignment(scope, `${_uKey}__${role}--assignment`, {
                        projectId: projectId,
                        groupId: identityGroup.id,
                        roleId: __role.id
                    })
                })
            }
        });

        const accKeysOutput: IamUserAccessKeysOutputMap = {};
        for(const key in this.accessKeys){
            const _val = this.accessKeys[key];
            accKeysOutput[key] = {
                accessKey: _val.id,
                secretKey: _val.secret
            }
        }
        new TerraformOutput(scope, 'sa_keys', {
            value: accKeysOutput,
            sensitive: true
        })
    }
}