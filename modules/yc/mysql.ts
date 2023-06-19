import {Construct} from "constructs";
import {
    StoreMysqlClusters,
    StoreMysqlDatabases,
    StoreMysqlUsers,
    StoreSubnets,
    StoreVpcs
} from "../../core/interfaces/yc/store";
import {
    MysqlAddUser,
    MysqlAddUserDatabaseAccess,
    MysqlCluster,
    MysqlDatabase, MysqlHostOutputMap,
    MysqlPasswordsOutputMap
} from "../../core/interfaces/yc/mysql";
import {LabelsInterface} from "../../core/labels";
import {MdbMysqlCluster} from "../../.gen/providers/yandex/mdb-mysql-cluster";
import {MdbMysqlDatabase} from "../../.gen/providers/yandex/mdb-mysql-database";
import {Password} from "../../.gen/providers/random/password";
import {MdbMysqlUser} from "../../.gen/providers/yandex/mdb-mysql-user";
import {TerraformOutput} from "cdktf";
import {PostgresHostOutputMap} from "../../core/interfaces/yc/postgres";

export class Mysql extends Construct{
    public clusters: StoreMysqlClusters = {};
    public databases: StoreMysqlDatabases = {};
    public users: StoreMysqlUsers = {};
    public addUsers: StoreMysqlUsers = {};

    private readonly networks: StoreVpcs = {};
    private readonly subnets: StoreSubnets = {};

    constructor(
        scope: Construct,
        name: string,
        clusters: MysqlCluster[],
        networks: StoreVpcs = {},
        subnets: StoreSubnets = {},
        defaultLabels: LabelsInterface = {}
    ) {
        super(scope, name);

        this.networks = networks;
        this.subnets = subnets;

        const __defaults = {
            connLimit: 10,
            version: '8.0',
            environment: 'PRODUCTION',
            resources: {
                resourcePresetId: 's2.micro',
                diskSize: 10,
                diskTypeId: 'network-hdd'
            },
            access: {
                dataLens: false,
                dataTransfer: false,
                webSql: false
            }
        }

        clusters.forEach((item: MysqlCluster) => {
            const _cId = item.name;

            const _clusterLabels = item.labels ? item.labels : {};
            const cluster = new MdbMysqlCluster(scope, _cId, {
                name: item.name,
                networkId: this.networks[item.network].id,
                environment: item.environment ? item.environment : __defaults.environment,
                version: item.version ? item.version : __defaults.version,

                resources: item.resources ? {
                    resourcePresetId: item.resources.resourcePresetId ? item.resources.resourcePresetId : __defaults.resources.resourcePresetId,
                    diskSize: item.resources.diskSize ? item.resources.diskSize : __defaults.resources.diskSize,
                    diskTypeId: item.resources.diskTypeId ? item.resources.diskTypeId : __defaults.resources.diskTypeId
                } : __defaults.resources,
                access: item.access ? {
                    dataLens: item.access.dataLens ? item.access.dataLens : __defaults.access.dataLens,
                    dataTransfer: item.access.dataTransfer ? item.access.dataTransfer : __defaults.access.dataTransfer,
                    webSql: item.access.webSql ? item.access.webSql : __defaults.access.webSql
                } : __defaults.access,
                host: [{
                    subnetId: this.subnets[`${item.network}__${item.host.subnet}`].id,
                    zone: this.subnets[`${item.network}__${item.host.subnet}`].zone,
                    assignPublicIp: item.host.isPublic
                }],
                labels: {...defaultLabels, ..._clusterLabels}
            });
            this.clusters[_cId] = cluster;

            item.databases.forEach((dbItem: MysqlDatabase) => {
                const _dId = `${_cId}__${dbItem.dbName}`;

                this.databases[_dId] = new MdbMysqlDatabase(scope, `${_dId}--db`, {
                    name: dbItem.dbName,
                    clusterId: cluster.id,
                    dependsOn: [cluster]
                });

                const __pass = new Password(scope, `${_dId}--pass`, {
                    length: 12,
                    minLower: 1,
                    minUpper: 1,
                    minSpecial: 0,
                    special: false
                });

                this.users[_dId] = new MdbMysqlUser(scope, `${_dId}--user`, {
                    clusterId: cluster.id,
                    name: dbItem.userName,
                    password: __pass.result,

                    permission: [{
                        databaseName: dbItem.dbName,
                        roles: ["ALL"]
                    }],

                    connectionLimits: {
                        maxConnectionsPerHour: dbItem.connLimit ? dbItem.connLimit : __defaults.connLimit,
                        maxUpdatesPerHour: dbItem.connLimit ? dbItem.connLimit : __defaults.connLimit,
                        maxQuestionsPerHour: dbItem.connLimit ? dbItem.connLimit : __defaults.connLimit,
                        maxUserConnections: dbItem.connLimit ? dbItem.connLimit : __defaults.connLimit
                    }
                })
            });

            if(item.addUsers){
                item.addUsers.forEach((uItem: MysqlAddUser) => {
                    const _uId = `${_cId}__${uItem.name}`;

                    const __pass = new Password(scope, `${_uId}--pass`, {
                        length: 12,
                        minLower: 1,
                        minUpper: 1,
                        minSpecial: 0,
                        special: false
                    });

                    this.addUsers[_uId] = new MdbMysqlUser(scope, `${_uId}--user`, {
                        clusterId: cluster.id,
                        name: uItem.name,
                        password: __pass.result,

                        permission: uItem.databasesAccess.map((uAccess: MysqlAddUserDatabaseAccess) => {
                            return {
                                databaseName: uAccess.dbName,
                                roles: uAccess.roles
                            }
                        }),
                        connectionLimits: {
                            maxConnectionsPerHour: uItem.connLimit ? uItem.connLimit : __defaults.connLimit,
                            maxUpdatesPerHour: uItem.connLimit ? uItem.connLimit : __defaults.connLimit,
                            maxQuestionsPerHour: uItem.connLimit ? uItem.connLimit : __defaults.connLimit,
                            maxUserConnections: uItem.connLimit ? uItem.connLimit : __defaults.connLimit
                        }
                    })
                });

            }
        });

        const usersOutput: MysqlPasswordsOutputMap = {};
        for(const key in this.users){
            const _val = this.users[key];
            usersOutput[key] = {
                clusterId: _val.clusterId,
                name: _val.name,
                password: _val.password
            }
        }
        new TerraformOutput(scope, 'mysql_users', {
            value: usersOutput,
            sensitive: true
        });


        const usersAddOutput: MysqlPasswordsOutputMap = {};
        for(const key in this.addUsers){
            const _val = this.addUsers[key];
            usersOutput[key] = {
                clusterId: _val.clusterId,
                name: _val.name,
                password: _val.password
            }
        }
        new TerraformOutput(scope, 'mysql_users_add', {
            value: usersAddOutput,
            sensitive: true
        });

        const hostsOutput  : MysqlHostOutputMap = {};
        for(const key in this.clusters){
            const _val = this.clusters[key];
            for(const hKey in _val.host.internalValue){
                const _hval = _val.host.get(parseInt(hKey));

                const __host_key = `pg__${key}__${hKey}`;
                hostsOutput[__host_key] = {
                    type: "CNAME",
                    value: _hval.fqdn
                }
            }

            ["master", "stable_replica"].forEach((role: string) => {
                const hkey = `pg__${key}__${role}`;
                hostsOutput[hkey] = {
                    type: "CNAME",
                    value: role === "master" ? `c-${_val.id}.rw.mdb.yandexcloud.net` : `c-${_val.id}.ro.mdb.yandexcloud.net`
                }
            });
        }
        new TerraformOutput(scope, 'mysql_network_data', {
            value: hostsOutput
        });
    }
}