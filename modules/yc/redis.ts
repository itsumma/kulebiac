import {Construct} from "constructs";
import {StoreRedisClusters, StoreSubnets, StoreVpcs} from "../../core/interfaces/yc/store";
import {RedisCluster, RedisHost, RedisHostOutputMap, RedisPasswordsOutputMap} from "../../core/interfaces/yc/redis";
import {LabelsInterface} from "../../core/labels";
import {StorePasswords} from "../../core/store";
import {Password} from "../../.gen/providers/random/password";
import {MdbRedisCluster} from "../../.gen/providers/yandex/mdb-redis-cluster";
import {TerraformOutput} from "cdktf";

export class Redis extends Construct{
    public clusters: StoreRedisClusters = {};

    private readonly networks: StoreVpcs = {};
    private readonly subnets: StoreSubnets = {};

    constructor(
        scope: Construct,
        name: string,
        clusters: RedisCluster[] = [],
        networks: StoreVpcs = {},
        subnets: StoreSubnets = {},
        defaultLabels: LabelsInterface = {}
    ) {
        super(scope, name);

        this.networks = networks;
        this.subnets = subnets;

        const __defaults = {
            version: "7.0",
            environment: "PRODUCTION",
            resources: {
                resourcePresetId: "hm3-c2-m8",
                diskSize: 16,
                diskTypeId: 'network-ssd'
            },
            databases: 1,
            persistence: "ON",
            tlsEnabled: false
        }

        clusters.forEach((item: RedisCluster) => {
            const _cId = item.name;
            const _clusterLabels = item.labels ? item.labels : {};
            const clusterPass = new Password(scope, `${_cId}--pass`, {
                length: 12,
                minLower: 1,
                minUpper: 1,
                minSpecial: 0,
                special: false
            });

            this.clusters[_cId] = new MdbRedisCluster(scope, _cId, {
                name: item.name,
                environment: item.environment ? item.environment : __defaults.environment,
                networkId: this.networks[item.network].id,
                tlsEnabled: item.tlsEnabled ? item.tlsEnabled : __defaults.tlsEnabled,
                persistenceMode: item.persistence ? item.persistence : __defaults.persistence,

                config: {
                    version: item.version ? item.version : __defaults.version,
                    password: clusterPass.result,
                    databases: item.databases ? item.databases : __defaults.databases
                },

                resources: item.resources ? {
                    resourcePresetId: item.resources.resourcePresetId ? item.resources.resourcePresetId : __defaults.resources.resourcePresetId,
                    diskTypeId: item.resources.diskTypeId ? item.resources.diskTypeId : __defaults.resources.diskTypeId,
                    diskSize: item.resources.diskSize ? item.resources.diskSize : __defaults.resources.diskSize
                } : __defaults.resources,

                host: [{
                    subnetId: this.subnets[`${item.network}__${item.host.subnet}`].id,
                    zone: this.subnets[`${item.network}__${item.host.subnet}`].zone,
                    assignPublicIp: item.host.isPublic
                }],

                labels: {...defaultLabels, ..._clusterLabels}
            })
        });

        const hostsOutput: RedisHostOutputMap = {};
        const passwordsOutput: RedisPasswordsOutputMap = {};

        for(const clusterKey in this.clusters){
            const _cluster = this.clusters[clusterKey];

            passwordsOutput[clusterKey] = {
                clusterId: _cluster.id,
                password: _cluster.config.password
            }

            for(const hKey in _cluster.host.internalValue){
                const hVal = _cluster.host.get(parseInt(hKey));

                hostsOutput[`${clusterKey}__${hKey}`] = {
                    type: "CNAME",
                    value: hVal.fqdn
                }
            }

            hostsOutput[`${clusterKey}__master`] = {
                type: "CNAME",
                value: `c-${_cluster.id}.rw.mdb.yandexcloud.net`
            }
        }

        new TerraformOutput(scope, 'redis_network_data', {
            value: hostsOutput
        });

        new TerraformOutput(scope, 'redis_passwords', {
            value: passwordsOutput,
            sensitive: true
        });
    }
}