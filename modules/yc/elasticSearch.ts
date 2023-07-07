import {Construct} from "constructs";
import {
    ElasticSearchCluster,
    ElasticSearchCLusterPasswordsOutputMap,
    ElasticSearchHostOutputMap
} from "../../core/interfaces/yc/elasticSearch";
import {StoreElasticSearchCluster, StoreSubnets, StoreVpcs} from "../../core/interfaces/yc/store";
import {LabelsInterface} from "../../core/labels";
import {MdbElasticsearchCluster} from "../../.gen/providers/yandex/mdb-elasticsearch-cluster";
import {Password} from "../../.gen/providers/random/password";
import {TerraformOutput} from "cdktf";

export class ElasticSearch extends Construct{

    public clusters: StoreElasticSearchCluster = {};

    private readonly networks: StoreVpcs = {};
    private readonly subnets: StoreSubnets = {};

    constructor(
        scope: Construct,
        name: string,
        clusters: ElasticSearchCluster[],
        networks: StoreVpcs = {},
        subnets: StoreSubnets = {},
        defaultLabels: LabelsInterface = {}
    ) {
        super(scope, name);

        this.networks = networks;
        this.subnets = subnets;

        const __defaults = {
            version: "7.17",
            edition: "basic",
            plugins: [],
            resources: {
                resourcePresetId: "s2.micro",
                diskTypeId: "network-ssd",
                diskSize: 100
            },
            isPublic: false
        }

        clusters.forEach((item: ElasticSearchCluster) => {
            const _cId = item.name

            const _clusterLabels = item.labels !== undefined ? item.labels : {};

            const __pass = new Password(scope, `${_cId}--pass`, {
                length: 12,
                minLower: 1,
                minUpper: 1,
                minSpecial: 0,
                special: false
            });

            this.clusters[_cId] = new MdbElasticsearchCluster(scope, _cId, {
                name: item.name,
                environment: item.environment,
                networkId: this.networks[item.network].id,

                config: {
                    edition: item.config !== undefined && item.config.edition !== undefined ? item.config.edition : __defaults.edition,
                    version: item.config !== undefined && item.config.version !== undefined ? item.config.version : __defaults.version,
                    adminPassword: __pass.result,

                    dataNode: item.config !== undefined && item.config.dataNode !== undefined ? {
                        resources: {
                            resourcePresetId: item.config.dataNode.resources !== undefined && item.config.dataNode.resources.resourcePresetId !== undefined ? item.config.dataNode.resources.resourcePresetId : __defaults.resources.resourcePresetId,
                            diskTypeId: item.config.dataNode.resources !== undefined && item.config.dataNode.resources.diskTypeId !== undefined ? item.config.dataNode.resources.diskTypeId : __defaults.resources.diskTypeId,
                            diskSize: item.config.dataNode.resources?.diskTypeId !== undefined && item.config.dataNode.resources.diskSize !== undefined ? item.config.dataNode.resources.diskSize : __defaults.resources.diskSize
                        }
                    } : {
                        resources: __defaults.resources
                    },
                    plugins: item.config !== undefined && item.config.plugins !== undefined ? item.config.plugins : __defaults.plugins
                },

                host: [{
                    name: `${item.name}__host`,
                    zone: this.subnets[`${item.network}__${item.subnet}`].zone,
                    subnetId: this.subnets[`${item.network}__${item.subnet}`].id,
                    type: 'DATA_NODE',
                    assignPublicIp: item.isPublic !== undefined ? item.isPublic : __defaults.isPublic
                }],

                labels: {...defaultLabels, ..._clusterLabels}
            });

            const passwordsOutput : ElasticSearchCLusterPasswordsOutputMap = {};
            const hostsOutput: ElasticSearchHostOutputMap = {};
            for (const key in this.clusters){
                const _val = this.clusters[key];
                passwordsOutput[key] = {
                    clusterId: _val.id,
                    password: _val.config.adminPassword
                }

                const __hosts = _val.host.internalValue;

                for(const hKey in __hosts){
                    const _hVal = _val.host.get(parseInt(hKey));
                    const __host_key = `es__${key}__${_hVal.type}_${hKey}`;
                    hostsOutput[__host_key] = {
                        value: _hVal.fqdn
                    };
                }

                ["master"].forEach((role: string) => {
                    const hKey = `es__${key}__${role}`;
                    hostsOutput[hKey] = {
                        value: `c-${_val.id}.rw.mdb.yandexcloud.net`
                    }
                })
            }

            new TerraformOutput(scope, 'es_passwords', {
                value: passwordsOutput,
                sensitive: true
            });

            new TerraformOutput(scope, 'es_network_data', {
                value: hostsOutput
            })
        });
    }
}