import {Construct} from "constructs";
import {StoreClickHouseClusters, StoreSubnets, StoreVpcs} from "../../core/interfaces/yc/store";
import {StorePasswords} from "../../core/store";
import {
    ClickHouseAddUser,
    ClickHouseCluster, ClickHouseDatabase,
    ClickHouseHost, ClickHouseHostOutput, ClickHouseHostsOutputMap, ClickHousePasswordsOutputMap
} from "../../core/interfaces/yc/clickHouse";
import {LabelsInterface} from "../../core/labels";
import {MdbClickhouseCluster, MdbClickhouseClusterUser} from "../../.gen/providers/yandex/mdb-clickhouse-cluster";
import {Password} from "../../.gen/providers/random/password";
import {TerraformOutput} from "cdktf";

export class ClickHouse extends Construct{
    public clusters: StoreClickHouseClusters = {};
    public passwords: StorePasswords = {};

    private readonly networks: StoreVpcs = {};
    private readonly subnets: StoreSubnets = {};

    constructor(
        scope: Construct,
        name: string,
        clusters: ClickHouseCluster[] = [],
        networks: StoreVpcs = {},
        subnets: StoreSubnets = {},
        defaultLabels: LabelsInterface = {}
    ) {
        super(scope, name);

        this.networks = networks;
        this.subnets = subnets;

        const __defaults = {
            version: "23.3",
            environment: 'PRODUCTION',
            resources: {
                resourcePresetId: 's3-c2-m8',
                diskSize: 10,
                diskTypeId: 'network-ssd'
            },
            access: {
                webSql: false,
                dataLens: false,
                metrika: false,
                serverless: false,
                yandexQuery: false,
                dataTransfer: false
            },
            hostTypeClick: "CLICKHOUSE"
        }

        clusters.forEach((item: ClickHouseCluster) => {
            const _cId = item.name;
            const _clusterLabels = item.labels ? item.labels : {};

            const clusterUsers: MdbClickhouseClusterUser[] = [];
            const clusterUsersTmp = item.addUsers ? [...item.databases, ...item.addUsers] : item.databases;
            clusterUsersTmp.forEach((_passItem: ClickHouseDatabase|ClickHouseAddUser) => {
                const _pId = `${item.name}__${_passItem.userName}`;
                this.passwords[_pId] = new Password(scope, _pId, {
                    length: 12,
                    minLower: 1,
                    minUpper: 1,
                    minSpecial: 0,
                    special: false
                });
            })

            item.databases.forEach((dbItem: ClickHouseDatabase) => {
                const _pId = `${item.name}__${dbItem.userName}`;
                clusterUsers.push({
                    name: dbItem.userName,
                    password: this.passwords[_pId].result,
                    permission: [{
                        databaseName: dbItem.dbName
                    }]
                })
            });

            item.addUsers?.forEach((addItem: ClickHouseAddUser) => {
                const _pId = `${item.name}__${addItem.userName}`;

                clusterUsers.push({
                    name: addItem.userName,
                    password: this.passwords[_pId].result,
                    permission: addItem.databases.map((__item: string) => {
                        return {
                            databaseName: __item
                        }
                    })
                })
            })

            this.clusters[_cId] = new MdbClickhouseCluster(scope, _cId, {
                name: item.name,
                environment: item.environment ? item.environment : __defaults.environment,
                networkId: this.networks[item.network].id,
                version: item.version ? item.version : __defaults.version,

                clickhouse: {
                    resources: item.resources ? {
                        resourcePresetId: item.resources.resourcePresetId ? item.resources.resourcePresetId : __defaults.resources.resourcePresetId,
                        diskTypeId: item.resources.diskTypeId ? item.resources.diskTypeId : __defaults.resources.diskTypeId,
                        diskSize: item.resources.diskSize ? item.resources.diskSize : __defaults.resources.diskSize
                    } : __defaults.resources
                },

                host: [{
                    subnetId: this.subnets[`${item.network}__${item.host.subnet}`].id,
                    zone: this.subnets[`${item.network}__${item.host.subnet}`].zone,
                    assignPublicIp: item.host.isPublic,
                    type: __defaults.hostTypeClick
                }],

                access: item.access ? {
                    webSql: item.access.webSql,
                    dataLens: item.access.dataLens,
                    metrika: item.access.metrika,
                    serverless: item.access.serverless,
                    yandexQuery: item.access.yandexQuery,
                    dataTransfer: item.access.dataTransfer

                } : __defaults.access,

                user: clusterUsers,

                database: item.databases.map((dbItem: ClickHouseDatabase) => {
                    return {
                        name: dbItem.dbName
                    }
                }),

                labels: {...defaultLabels, ..._clusterLabels}
            })
        });

        const usersOutput: ClickHousePasswordsOutputMap = {};
        const hostsOutput: ClickHouseHostsOutputMap = {};

        for(const clusterKey in this.clusters){
            const _cluster = this.clusters[clusterKey];

            for(const uKey in _cluster.user.internalValue){
                const uVal = _cluster.user.get(parseInt(uKey));
                usersOutput[`${clusterKey}__${uKey}`] = {
                    clusterId: _cluster.id,
                    name: uVal.name,
                    password: uVal.password
                }
            }

            for(const hKey in _cluster.host.internalValue){
                const hVal = _cluster.host.get(parseInt(hKey));
                hostsOutput[`${clusterKey}__${hKey}`] = {
                    value: hVal.fqdn
                }
            }
        }

        new TerraformOutput(scope, 'clickhouse_users', {
            value: usersOutput,
            sensitive: true
        });

        new TerraformOutput(scope, 'clickhouse_network_data', {
            value: hostsOutput
        });
    }
}