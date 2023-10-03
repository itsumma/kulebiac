import {Construct} from "constructs";
import {
    StoreElasticIps, StorePgUsers,
    StorePostgresClusters,
    StoreSecGroups,
    StoreSubnets,
    StoreVpcs
} from "../../core/interfaces/sber/store";
import {
    PostgresCluster,
    PostgresClustersOutputMap,
    PostgresDatabase,
    PostgresUserOutput, PostgresUsersOutputMap
} from "../../core/interfaces/sber/postgres";
import {LabelsInterface} from "../../core/labels";
import {DataSbercloudNetworkingSecgroup} from "../../.gen/providers/sbercloud/data-sbercloud-networking-secgroup";
import {RdsInstance} from "../../.gen/providers/sbercloud/rds-instance";
import {Password} from "../../.gen/providers/random/password";
import {Fn, TerraformOutput} from "cdktf";
import {DataSbercloudNetworkingPort} from "../../.gen/providers/sbercloud/data-sbercloud-networking-port";
import {NetworkingEipAssociate} from "../../.gen/providers/sbercloud/networking-eip-associate";
import {PostgresqlProvider} from "@cdktf/provider-postgresql/lib/provider";
import {Role} from "@cdktf/provider-postgresql/lib/role";
import {Database} from "@cdktf/provider-postgresql/lib/database";
import {Extension} from "@cdktf/provider-postgresql/lib/extension";

export class Postgres extends Construct{
    public clusters : StorePostgresClusters = {};
    public users: StorePgUsers = {};

    private readonly networks: StoreVpcs = {};
    private readonly subnets: StoreSubnets = {};
    private readonly secGroups: StoreSecGroups = {};
    private readonly elasticIps: StoreElasticIps = {};

    constructor(
        scope: Construct,
        name: string,
        clusters: PostgresCluster[],
        networks: StoreVpcs = {},
        subnets: StoreSubnets = {},
        secGroups: StoreSecGroups = {},
        elasticIps: StoreElasticIps = {},
        defaultSecGroup: DataSbercloudNetworkingSecgroup,
        defaultLabels: LabelsInterface = {}
    ) {
        super(scope, name);

        this.networks = networks;
        this.subnets = subnets;
        this.secGroups = secGroups;
        this.elasticIps = elasticIps;

        const __defaults = {
            version: "12",
            availabilityZone: "ru-moscow-1a",
            flavorId: "rds.pg.c6.large.2",
            volume: {
                size: 100,
                type: "HIGH"
            },
            backupStrategy: {
                startTime: "00:00-01:00",
                keepDays: 7
            },
            connLimit: 10,
            lcCollate: 'en_US.UTF-8',
            lcType: 'en_US.UTF-8',
        }

        const POSTGRES = 'PostgreSQL';
        const DEFAULT_SEC_GROUP = 'default';

        clusters.forEach((item: PostgresCluster) => {
            const _cId = item.name;

            const __pass = item.rootPassword ? item.rootPassword : new Password(scope, `${_cId}--pass`, {
                length: 12,
                minLower: 1,
                minUpper: 1,
                minSpecial: 1,
                minNumeric: 1,
                overrideSpecial: "!@#%^?"
            }).result;

            const _clusterLabels = item.labels ? item.labels : {};
            const cluster = new RdsInstance(scope, _cId, {
                name: item.name,
                flavor: item.flavorId ? item.flavorId : __defaults.flavorId,
                vpcId: this.networks[item.network].id,
                subnetId: this.subnets[`${item.network}__${item.subnet}`].id,
                securityGroupId: item.secGroup === DEFAULT_SEC_GROUP ? defaultSecGroup.id : this.secGroups[item.secGroup].id,

                availabilityZone: [item.availabilityZone ? item.availabilityZone : __defaults.availabilityZone],

                db: {
                    type: POSTGRES,
                    version: item.version ? item.version : __defaults.version,
                    password: __pass
                },

                volume: item.volume ? {
                    size: item.volume.size ? item.volume.size : __defaults.volume.size,
                    type: item.volume.type ? item.volume.type : __defaults.volume.type
                } : __defaults.volume,

                backupStrategy: item.backupStrategy ? {
                    startTime: item.backupStrategy.startTime ? item.backupStrategy.startTime : __defaults.backupStrategy.startTime,
                    keepDays: item.backupStrategy.keepDays ? item.backupStrategy.keepDays : __defaults.backupStrategy.keepDays
                } : __defaults.backupStrategy,

                tags: {...defaultLabels, ..._clusterLabels}
            });
            this.clusters[_cId] = cluster;

            if(item.eip){
                const __address = this.elasticIps[item.eip].address;

                const __rdsPort = new DataSbercloudNetworkingPort(scope, `${_cId}--rds-port`, {
                    networkId: this.subnets[`${item.network}__${item.subnet}`].id,
                    fixedIp: Fn.element(cluster.privateIps, 0)
                });

                const __binding = new NetworkingEipAssociate(scope, `${_cId}--eip-associate`, {
                    publicIp: __address,
                    portId: __rdsPort.id
                })

                if(item.databases){
                    const pgProvider = new PostgresqlProvider(scope, `${_cId}--pg-provider`, {
                        alias: `${_cId}--pg`,
                        host: __address,
                        port: 5432,
                        username: 'root',
                        database: 'postgres',
                        password: cluster.db.password,
                        superuser: false
                    });

                    item.databases.forEach((dbItem: PostgresDatabase) => {
                        const _dId = `${_cId}__db__${dbItem.dbName}`;
                        const _uId = `${_cId}__user__${dbItem.userName}`;
                        const _pid = `${_uId}--pass`;

                        const __pass = new Password(scope, _pid, {
                            length: 12,
                            minLower: 1,
                            minUpper: 1,
                            minSpecial: 1,
                            minNumeric: 1,
                            overrideSpecial: "!@#%^?"
                        });

                        const __user = new Role(scope, _uId, {
                            dependsOn: [__binding, cluster],
                            provider: pgProvider,
                            name: dbItem.userName,
                            password: __pass.result,
                            login: true,
                            connectionLimit: dbItem.connLimit ? dbItem.connLimit : __defaults.connLimit
                        });
                        this.users[_uId] = __user;

                        const __db = new Database(scope, _dId, {
                            dependsOn: [__binding, cluster, __user],
                            provider: pgProvider,
                            name: dbItem.dbName,
                            lcCollate: __defaults.lcCollate,
                            lcCtype: __defaults.lcType,
                            owner: __user.name
                        });

                        if(dbItem.extensions){
                            dbItem.extensions.forEach((ext: string) => {
                                const _eId = `${_dId}--${ext}`;
                                new Extension(scope, _eId, {
                                    dependsOn: [__binding, cluster, __user, __db],
                                    provider: pgProvider,
                                    name: ext,
                                    database: __db.name
                                })
                            })
                        }
                    });
                }
            }
        });

        const pgOutput: PostgresClustersOutputMap = {};
        for(const key in this.clusters){
            const _val = this.clusters[key];
            pgOutput[key] = {
                clusterId: _val.id,
                password: _val.db.password,
                privateIps: _val.privateIps,
                publicIps: _val.publicIps
            }
        }
        new TerraformOutput(scope, 'pg_data', {
            value: pgOutput,
            sensitive: true
        });

        const usersOutput: PostgresUsersOutputMap = {};
        for(const key in this.users){
            const _val = this.users[key];
            usersOutput[key] = {
                userName: _val.name,
                password: _val.password
            }
        }
        new TerraformOutput(scope, 'pg_users', {
            value: usersOutput,
            sensitive: true
        })
    }
}