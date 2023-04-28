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

export class Postgres extends Construct{

    public clusters: StorePostgresClusters = {};
    public users: StorePostgresUser = {};
    public addUsers: StorePostgresUser = {};
    public databases: StorePostgresDatabases = {};

    private readonly networks: StoreVpcs = {};
    private readonly subnets: StoreSubnets = {};

    constructor(
        scope : Construct,
        name: string,
        clusters: PostgresCluster[],
        networks: StoreVpcs = {},
        subnets: StoreSubnets = {}
    ) {
        super(scope, name);

        this.networks = networks;
        this.subnets = subnets;

        const __defaults = {
            connLimit : 10,
            grants: [],
            databasesAccess: [],
            extensions: [],
            lcCollate: 'en_US.UTF-8',
            lcType: 'en_US.UTF-8'
        }

        clusters.forEach((item: PostgresCluster) => {
            const _cId = item.name;
            const cluster = new MdbPostgresqlCluster(scope, _cId, {
                name: item.name,
                environment: item.environment,
                networkId: this.networks[item.network].id,

                config: {
                    version: item.version,
                    resources: {
                        diskSize: item.resources.diskSize,
                        diskTypeId: item.resources.diskType,
                        resourcePresetId: item.resources.resourcePreset
                    }
                },

                host : [{
                    subnetId: this.subnets[`${item.network}__${item.subnet}`].id,
                    zone: this.subnets[`${item.network}__${item.subnet}`].zone
                }]
            });
            this.clusters[_cId] = cluster;

            item.databases.forEach((dbItem: PostgresDatabase) => {
                const _dId = `${_cId}__${dbItem.dbName}`;
                const __pass = new Password(scope, `${_dId}--pass`, {
                    length: 12,
                    minLower: 1,
                    minUpper: 1,
                    minSpecial: 0,
                    special: false
                });

                const user = new MdbPostgresqlUser(scope, `${_dId}--user`, {
                    clusterId: cluster.id,
                    name: dbItem.userName,
                    connLimit: dbItem.connLimit !== undefined ? dbItem.connLimit : __defaults.connLimit,
                    password: __pass.result,
                    grants: dbItem.userGrants !== undefined ? dbItem.userGrants : __defaults.grants
                });
                this.users[_dId] = user;

                this.databases[_dId] = new MdbPostgresqlDatabase(scope, `${_dId}--db`, {
                    clusterId: cluster.id,
                    name: dbItem.dbName,
                    owner: user.name,
                    lcCollate: __defaults.lcCollate,
                    lcType: __defaults.lcType,
                    extension: dbItem.extensions !== undefined ? dbItem.extensions : __defaults.extensions
                });
            });

            item.addUsers.forEach((uItem : PostgresAddUser) => {
                const _uId = `${_cId}__${uItem.name}`;

                const __pass = new Password(scope, `${_uId}--pass`, {
                    length: 12,
                    minLower: 1,
                    minUpper: 1,
                    minSpecial: 0,
                    special: false
                });

                const __grants = uItem.grants !== undefined ? uItem.grants : __defaults.grants;
                const __dbs = uItem.databasesAccess !== undefined ? uItem.databasesAccess : __defaults.databasesAccess;

                this.addUsers[_uId] = new MdbPostgresqlUser(scope, `${_uId}--user`, {
                    clusterId: cluster.id,
                    name: uItem.name,
                    connLimit: uItem.connLimit !== undefined ? uItem.connLimit : __defaults.connLimit,
                    password: __pass.result,
                    grants: [...__grants, ...__dbs],
                    permission: __dbs.map((value: string) => {
                        return {
                            databaseName: value
                        }
                    }),
                    dependsOn: [...generateDepsArr(this.databases)]
                });
            });
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
        new TerraformOutput(scope, 'pg_network_data', {
            value: hostsOutput
        });
    }
}