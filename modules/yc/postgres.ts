import {Construct} from "constructs";
import {
    StorePostgresClusters,
    StorePostgresDatabases,
    StorePostgresUser,
    StoreSubnets,
    StoreVpcs
} from "../../core/interfaces/yc/store";

import {MdbPostgresqlCluster} from "../../.gen/providers/yandex/mdb-postgresql-cluster";
import {Password} from "../../.gen/providers/random/password";
import {MdbPostgresqlDatabase} from "../../.gen/providers/yandex/mdb-postgresql-database";
import {MdbPostgresqlUser} from "../../.gen/providers/yandex/mdb-postgresql-user";
import {TerraformOutput} from "cdktf";
import {
    PostgresAddUser,
    PostgresCluster,
    PostgresDatabase, PostgresHostOutputMap,
    PostgresPasswordsOutputMap
} from "../../core/interfaces/yc/postgres";
import {generateDepsArr} from "../../core/deps";
import {LabelsInterface} from "../../core/labels";
import {StorePasswords} from "../../core/store";

export class Postgres extends Construct{

    public clusters: StorePostgresClusters = {};
    public users: StorePostgresUser = {};
    public addUsers: StorePostgresUser = {};
    public databases: StorePostgresDatabases = {};
    public passwords: StorePasswords = {};

    private readonly networks: StoreVpcs = {};
    private readonly subnets: StoreSubnets = {};

    constructor(
        scope : Construct,
        name: string,
        clusters: PostgresCluster[],
        networks: StoreVpcs = {},
        subnets: StoreSubnets = {},
        defaultLabels: LabelsInterface = {}
    ) {
        super(scope, name);

        this.networks = networks;
        this.subnets = subnets;

        const __defaults = {
            connLimit : 10,
            version: '12',
            environment: 'PRODUCTION',
            grants: [],
            databasesAccess: [],
            extensions: [],
            lcCollate: 'en_US.UTF-8',
            lcType: 'en_US.UTF-8',
            resources: {
                resourcePresetId: 's2.micro',
                diskSize: 10,
                diskTypeId: 'network-hdd'
            },
            access: {
                dataLens: false,
                dataTransfer: false,
                webSql: false,
                serverless: false
            }
        }

        clusters.forEach((item: PostgresCluster) => {
            const _cId = item.name;

            const _clusterLabels = item.labels ? item.labels : {};
            const cluster = new MdbPostgresqlCluster(scope, _cId, {
                name: item.name,
                environment: item.environment ? item.environment : __defaults.environment,
                networkId: this.networks[item.network].id,

                config: {
                    version: item.version ? item.version : __defaults.version,
                    resources: item.resources ? {
                        diskSize: item.resources.diskSize ? item.resources.diskSize : __defaults.resources.diskSize,
                        diskTypeId: item.resources.diskTypeId ? item.resources.diskTypeId : __defaults.resources.diskTypeId,
                        resourcePresetId: item.resources.resourcePresetId ? item.resources.resourcePresetId : __defaults.resources.resourcePresetId
                    } : __defaults.resources,
                    access: item.access ?  {
                        dataLens: item.access.dataLens ? item.access.dataLens : __defaults.access.dataLens,
                        dataTransfer: item.access.dataTransfer ? item.access.dataTransfer : __defaults.access.dataTransfer,
                        serverless: item.access.serverless ? item.access.serverless : __defaults.access.serverless,
                        webSql: item.access.webSql ? item.access.webSql : __defaults.access.webSql
                    }: __defaults.access
                },

                host : [{
                    subnetId: this.subnets[`${item.network}__${item.host.subnet}`].id,
                    zone: this.subnets[`${item.network}__${item.host.subnet}`].zone,
                    assignPublicIp: item.host.isPublic
                }],
                labels: {...defaultLabels, ..._clusterLabels}
            });
            this.clusters[_cId] = cluster;

            item.databases.forEach((dbItem: PostgresDatabase) => {
                const _dId = `${_cId}__${dbItem.dbName}`;
                const _uId = `${_cId}__${dbItem.userName}`;
                const _pId = `${_uId}--pass`;

                const __pass = new Password(scope, _pId, {
                    length: 12,
                    minLower: 1,
                    minUpper: 1,
                    minSpecial: 0,
                    special: false
                });
                this.passwords[_pId] = __pass;

                const user = new MdbPostgresqlUser(scope, `${_uId}--user`, {
                    clusterId: cluster.id,
                    name: dbItem.userName,
                    connLimit: dbItem.connLimit ? dbItem.connLimit : __defaults.connLimit,
                    password: __pass.result,
                    grants: dbItem.userGrants ? dbItem.userGrants : __defaults.grants
                });
                this.users[_dId] = user;

                this.databases[_dId] = new MdbPostgresqlDatabase(scope, `${_dId}--db`, {
                    clusterId: cluster.id,
                    name: dbItem.dbName,
                    owner: user.name,
                    lcCollate: __defaults.lcCollate,
                    lcType: __defaults.lcType,
                    extension: dbItem.extensions ? dbItem.extensions.map((extName: string) => {
                        return {
                            name: extName
                        }
                    }) : __defaults.extensions
                });
            });

            if(item.addUsers){
                item.addUsers.forEach((uItem : PostgresAddUser) => {
                    const _uId = `${_cId}__${uItem.userName}`;
                    const _pId = `${_uId}--pass`

                    const __pass = new Password(scope, _pId, {
                        length: 12,
                        minLower: 1,
                        minUpper: 1,
                        minSpecial: 0,
                        special: false
                    });
                    this.passwords[_pId] = __pass;

                    const __grants = uItem.grants ? uItem.grants : __defaults.grants;
                    const __dbs = uItem.databasesAccess ? uItem.databasesAccess : __defaults.databasesAccess;

                    this.addUsers[_uId] = new MdbPostgresqlUser(scope, `${_uId}--user`, {
                        clusterId: cluster.id,
                        name: uItem.userName,
                        connLimit: uItem.connLimit ? uItem.connLimit : __defaults.connLimit,
                        password: __pass.result,
                        grants: [...__grants],
                        permission: __dbs.map((value: string) => {
                            return {
                                databaseName: value
                            }
                        }),
                        dependsOn: [...generateDepsArr(this.databases)]
                    });
                });
            }

        });

        const usersOutput: PostgresPasswordsOutputMap = {};
        for(const key in this.users){
            const _val = this.users[key];
            usersOutput[key] = {
                clusterId: _val.clusterId,
                name: _val.name,
                password: _val.password
            }
        }
        new TerraformOutput(scope, 'pg_users', {
            value: usersOutput,
            sensitive: true
        });

        const usersAddOutput: PostgresPasswordsOutputMap = {};
        for(const key in this.addUsers){
            const _val = this.addUsers[key];
            usersAddOutput[key] = {
                clusterId: _val.clusterId,
                name: _val.name,
                password: _val.password
            }
        }
        new TerraformOutput(scope, 'pg_users_add', {
            value: usersAddOutput,
            sensitive: true
        });

        const hostsOutput  : PostgresHostOutputMap = {};
        for(const key in this.clusters){
            const _val = this.clusters[key];
            for(const hKey in _val.host.internalValue){
                const _hval = _val.host.get(parseInt(hKey));

                const __host_key = `pg__${key}__${hKey}`;
                hostsOutput[__host_key] = {
                    value: _hval.fqdn
                }
            }

            ["master", "stable_replica"].forEach((role: string) => {
                const hkey = `pg__${key}__${role}`;
                hostsOutput[hkey] = {
                    value: role === "master" ? `c-${_val.id}.rw.mdb.yandexcloud.net` : `c-${_val.id}.ro.mdb.yandexcloud.net`
                }
            });
        }
        new TerraformOutput(scope, 'pg_network_data', {
            value: hostsOutput
        });
    }
}