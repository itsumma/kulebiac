import {Construct} from "constructs";
import {StoreMongoClusters, StoreSubnets, StoreVpcs} from "../../core/interfaces/yc/store";
import {
    MongoAddUser,
    MongoCluster,
    MongoDatabase,
    MongoHostsOutputMap,
    MongoPasswordsOutputMap,
    MongoUserPermission
} from "../../core/interfaces/yc/mongo";
import {LabelsInterface} from "../../core/labels";
import {MdbMongodbCluster, MdbMongodbClusterUser} from "../../.gen/providers/yandex/mdb-mongodb-cluster";
import {StorePasswords} from "../../core/store";
import {Password} from "../../.gen/providers/random/password";
import {TerraformOutput} from "cdktf";

export class Mongo extends Construct{
    public clusters: StoreMongoClusters = {};
    public passwords: StorePasswords = {};

    private readonly networks: StoreVpcs = {};
    private readonly subnets: StoreSubnets = {};

    constructor(
        scope: Construct,
        name: string,
        clusters: MongoCluster[] = [],
        networks: StoreVpcs = {},
        subnets: StoreSubnets = {},
        defaultLabels: LabelsInterface = {}
    ) {
        super(scope, name);

        this.networks = networks;
        this.subnets = subnets;

        const __defaults = {
            version: '6.0',
            environment: 'PRODUCTION',
            resources: {
                resourcePresetId: 's2.micro',
                diskSize: 10,
                diskTypeId: 'network-hdd'
            },
            access: {
                dataLens: false,
                dataTransfer: false
            },
            userRoles: ['readWrite'],
            adminRoles: ['mdbDbAdmin']
        }

        clusters.forEach((item: MongoCluster) => {
            const _cId = item.name;
            const _clusterLabels = item.labels ? item.labels : {};

            const clusterUsers : MdbMongodbClusterUser[] = [];
            const clusterUsersTmp = item.addUsers? [...item.databases, ...item.addUsers] : item.databases;
            clusterUsersTmp.forEach((_passItem: MongoDatabase|MongoAddUser) => {
                const _pId = `${item.name}__${_passItem.userName}`;
                this.passwords[_pId] = new Password(scope, _pId, {
                    length: 12,
                    minLower: 1,
                    minUpper: 1,
                    minSpecial: 0,
                    special: false
                });
            });

            item.databases.forEach((dbItem: MongoDatabase) => {
                const _pId = `${item.name}__${dbItem.userName}`;
                clusterUsers.push({
                    name: dbItem.userName,
                    password: this.passwords[_pId].result,
                    permission: [{
                        databaseName: dbItem.dbName,
                        roles: __defaults.adminRoles
                    }]
                })
            });

            item.addUsers?.forEach((addItem: MongoAddUser) => {
                const _pId = `${item.name}__${addItem.userName}`;
                clusterUsers.push({
                    name: addItem.userName,
                    password: this.passwords[_pId].result,
                    permission: addItem.permissions.map((perm: MongoUserPermission) => {
                        return {
                            databaseName: perm.dbName,
                            roles: perm.roles ? perm.roles : __defaults.userRoles
                        }
                    })
                })
            })


            this.clusters[_cId] = new MdbMongodbCluster(scope, _cId, {
                name: item.name,
                networkId: this.networks[item.network].id,
                environment: item.environment ? item.environment : __defaults.environment,

                clusterConfig: {
                    version: item.version ? item.version : __defaults.version,
                    access: item.access ? {
                        dataLens: item.access.dataLens ? item.access.dataLens : __defaults.access.dataLens,
                        dataTransfer: item.access.dataTransfer ? item.access.dataTransfer : __defaults.access.dataTransfer
                    } : __defaults.access
                },

                resourcesMongod: item.resources ? {
                    resourcePresetId: item.resources.resourcePresetId ? item.resources.resourcePresetId : __defaults.resources.resourcePresetId,
                    diskSize: item.resources.diskSize ? item.resources.diskSize : __defaults.resources.diskSize,
                    diskTypeId: item.resources.diskTypeId ? item.resources.diskTypeId : __defaults.resources.diskTypeId
                } : __defaults.resources,


                host: [
                    {
                        subnetId: this.subnets[`${item.network}__${item.host.subnet}`].id,
                        zoneId: this.subnets[`${item.network}__${item.host.subnet}`].zone,
                        assignPublicIp: item.host.isPublic
                    }
                ],

                user: clusterUsers,
                database: item.databases.map((dbItem: MongoDatabase) => {
                    return {
                        name: dbItem.dbName
                    }
                }),

                labels: {...defaultLabels, ..._clusterLabels}
            });
        });

        const hostsOutput: MongoHostsOutputMap = {};
        const usersOutput: MongoPasswordsOutputMap = {};

        for(const clusterKey in this.clusters){
            const _cluster = this.clusters[clusterKey];
            for(const uKey in _cluster.user.internalValue){
                const uVal = _cluster.user.get(parseInt((uKey)));
                usersOutput[`${clusterKey}__${uKey}`] = {
                    clusterId: _cluster.id,
                    name: uVal.name,
                    password: uVal.password
                }
            }

            for(const hKey in _cluster.host.internalValue){
                const hVal = _cluster.host.get(parseInt(hKey));
                hostsOutput[`${clusterKey}__${hKey}`] = {
                    value: hVal.name
                }
            }
        }
        new TerraformOutput(scope, 'mongo_users', {
            value: usersOutput,
            sensitive: true
        });

        new TerraformOutput(scope, 'mongo_network_data', {
            value: hostsOutput
        })
    }
}