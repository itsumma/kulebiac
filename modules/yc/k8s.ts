import {Construct} from "constructs";
import {
    Kubernetes,
    KubernetesClustersOutputMap,
    KubernetesWorkerGroup
} from "../../core/interfaces/yc/k8s";
import {
    StoreAccountKeys,
    StoreBuckets, StoreFolderRoles,
    StoreKubernetesClusters,
    StoreKubernetesWorkerGroups,
    StoreServiceAccounts, StoreStaticAccessKeys, StoreStaticIps,
    StoreSubnets,
    StoreVpcs
} from "../../core/interfaces/yc/store";
import {KubernetesCluster} from "../../.gen/providers/yandex/kubernetes-cluster";
import {KubernetesNodeGroup} from "../../.gen/providers/yandex/kubernetes-node-group";
import {TerraformOutput} from "cdktf";
import {DataYandexClientConfig} from "../../.gen/providers/yandex/data-yandex-client-config";
import {HelmProvider} from "@cdktf/provider-helm/lib/provider";
import {KubernetesProvider} from "@cdktf/provider-kubernetes/lib/provider";
import {KubectlProvider} from "../../.gen/providers/kubectl/provider";
import {K8sAddons} from "./k8sAddons";
import {LabelsInterface} from "../../core/labels";
import {generateDepsArr} from "../../core/deps";

export class K8s extends Construct{

    public clusters : StoreKubernetesClusters = {};
    public workerGroups: StoreKubernetesWorkerGroups = {};

    private readonly networks : StoreVpcs = {};
    private readonly subnets : StoreSubnets = {};
    private readonly serviceAccounts: StoreServiceAccounts = {};
    private readonly folderRoles: StoreFolderRoles = {};
    private readonly staticIps: StoreStaticIps = {};
    private readonly staticAccessKeys: StoreStaticAccessKeys = {};
    private readonly accountKeys: StoreAccountKeys = {};
    private readonly buckets: StoreBuckets = {};

    constructor(
        scope: Construct,
        name: string,
        clusters: Kubernetes[],
        networks: StoreVpcs = {},
        subnets: StoreSubnets = {},
        serviceAccounts: StoreServiceAccounts = {},
        folderRoles: StoreFolderRoles = {},
        staticIps: StoreStaticIps = {},
        staticAccessKeys: StoreStaticAccessKeys = {},
        accountsKeys: StoreAccountKeys = {},
        buckets: StoreBuckets = {},
        defaultLabels: LabelsInterface = {}
    ) {
        super(scope, name);

        this.networks = networks;
        this.subnets = subnets;
        this.serviceAccounts = serviceAccounts;
        this.folderRoles = folderRoles;
        this.staticIps = staticIps;
        this.staticAccessKeys = staticAccessKeys;
        this.accountKeys = accountsKeys;
        this.buckets = buckets;

        const __defaultMasterParams = {
            isPublic: true,
            version: '1.24',
            region: 'ru-central1',
            autoUpgrade: false,
            networkPolicyProvider: "CALICO",
            releaseChannel: "STABLE"
        }

        const __defaultWorkersParams = {
            version: '1.24',
            resources: {
                cpu: 2,
                memory: 16,
                diskSize: 30,
                diskType: 'network-hdd'
            },
            scalePolicy: {
                autoScaleMode: false,
                fixedScaleSize: 3,
                autoScaleMin: 1,
                autoScaleMax: 3,
                autoScaleInitial: 1
            },
            preemptible: false,
            platformId: 'standard-v2',
            nat: false,
            autoUpgrade: false,
            autoRepair: false,
            nodeLabels: {},
            nodeTaints: []
        }

        clusters.forEach((item : Kubernetes) => {
            const _cId = item.name;

            const _clusterLabels = item.labels !== undefined ? item.labels : {};
            const cluster = new KubernetesCluster(scope, _cId, {
                dependsOn: [...generateDepsArr(this.serviceAccounts), ...generateDepsArr(this.folderRoles)],


                name: item.name,
                networkId: this.networks[item.network].id,
                nodeServiceAccountId: this.serviceAccounts[item.nodesSa].id,
                serviceAccountId: this.serviceAccounts[item.clusterSa].id,
                networkPolicyProvider: __defaultMasterParams.networkPolicyProvider,
                releaseChannel: __defaultMasterParams.releaseChannel,
                clusterIpv4Range: item.additionalParams !== undefined ? item.additionalParams.clusterIpv4Range : undefined,
                serviceIpv4Range: item.additionalParams !== undefined ? item.additionalParams.serviceIpv4Range : undefined,

                master: {
                    version: item.version !== undefined ? item.version : __defaultMasterParams.version,
                    publicIp: item.isPublic !== undefined ? item.isPublic : __defaultMasterParams.isPublic,
                    maintenancePolicy: {
                        autoUpgrade: __defaultMasterParams.autoUpgrade
                    },
                    zonal :  {
                        zone: this.subnets[`${item.network}__${item.subnet}`].zone,
                        subnetId: this.subnets[`${item.network}__${item.subnet}`].id
                    }
                },
                labels: {...defaultLabels, ..._clusterLabels}
            });

            this.clusters[_cId] = cluster;

            item.workerGroups.forEach((wItem: KubernetesWorkerGroup) => {
                const _wId = `${_cId}__${wItem.name}`;

                const _workerGroupLabels = wItem.labels !== undefined ? wItem.labels : {};
                const autoScaleMode = wItem.scalePolicy !== undefined && wItem.scalePolicy.autoScaleMode !== undefined ? wItem.scalePolicy.autoScaleMode : __defaultWorkersParams.scalePolicy.autoScaleMode;

                this.workerGroups[_wId] = new KubernetesNodeGroup(scope, _wId, {
                    clusterId: cluster.id,
                    name: wItem.name,
                    version: wItem.version !== undefined ? wItem.version : __defaultWorkersParams.version,

                    labels: {...defaultLabels, ..._workerGroupLabels},

                    nodeLabels: wItem.nodeLabels !== undefined ? wItem.nodeLabels : __defaultWorkersParams.nodeLabels,
                    nodeTaints: wItem.nodeTaints !== undefined ? wItem.nodeTaints : __defaultWorkersParams.nodeTaints,

                    instanceTemplate: {
                        platformId: wItem.platformId !== undefined ? wItem.platformId : __defaultWorkersParams.platformId,
                        name: wItem.instanceName,
                        resources: {
                            memory: wItem.resources !== undefined && wItem.resources.memory !== undefined ? wItem.resources.memory : __defaultWorkersParams.resources.memory,
                            cores: wItem.resources !== undefined && wItem.resources.cpu !== undefined ? wItem.resources.cpu : __defaultWorkersParams.resources.cpu
                        },
                        bootDisk: {
                            size: wItem.resources !== undefined && wItem.resources.diskSize !== undefined ? wItem.resources.diskSize : __defaultWorkersParams.resources.diskSize,
                            type: wItem.resources !== undefined && wItem.resources.diskType !== undefined ? wItem.resources.diskType : __defaultWorkersParams.resources.diskType
                        },
                        schedulingPolicy: {
                            preemptible: wItem.preemptible !== undefined ? wItem.preemptible : __defaultWorkersParams.preemptible
                        },
                        networkInterface: [{
                            nat: wItem.nat !== undefined ? wItem.nat : __defaultWorkersParams.nat,
                            subnetIds: [this.subnets[`${item.network}__${item.subnet}`].id]
                        }]
                    },
                    allocationPolicy: {
                        location: [{
                            zone: this.subnets[`${item.network}__${item.subnet}`].zone
                        }]
                    },
                    scalePolicy: {
                        autoScale: autoScaleMode ? {
                            min: wItem.scalePolicy !== undefined && wItem.scalePolicy.autoScaleMin !== undefined ? wItem.scalePolicy.autoScaleMin : __defaultWorkersParams.scalePolicy.autoScaleMin,
                            max: wItem.scalePolicy !== undefined && wItem.scalePolicy.autoScaleMax !== undefined ? wItem.scalePolicy.autoScaleMax : __defaultWorkersParams.scalePolicy. autoScaleMax,
                            initial: wItem.scalePolicy !== undefined && wItem.scalePolicy.autoScaleInitial !== undefined ? wItem.scalePolicy.autoScaleInitial : __defaultWorkersParams.scalePolicy.autoScaleInitial
                        }: undefined ,
                        fixedScale: !autoScaleMode ? {
                            size: wItem.scalePolicy !== undefined && wItem.scalePolicy.fixedScaleSize !== undefined ? wItem.scalePolicy.fixedScaleSize : __defaultWorkersParams.scalePolicy.fixedScaleSize
                        } : undefined
                    },
                    maintenancePolicy: {
                        autoUpgrade: wItem.autoUpgrade !== undefined ? wItem.autoUpgrade : __defaultWorkersParams.autoUpgrade,
                        autoRepair: wItem.autoRepair !== undefined ? wItem.autoRepair : __defaultWorkersParams.autoRepair
                    }
                })
            });



            const client = new DataYandexClientConfig(scope, `${_cId}__config`, {});
            const helmProvider = new HelmProvider(scope, `${_cId}--helm-provider`, {
                alias: `${_cId}--helm`,
                kubernetes: {
                    host: cluster.master.externalV4Endpoint,
                    clusterCaCertificate: cluster.master.clusterCaCertificate,
                    token: client.iamToken
                }
            });
            const k8sProvider = new KubernetesProvider(scope, `${_cId}--k8s-provider`,{
                alias: `${_cId}--k8s`,
                clusterCaCertificate: cluster.master.clusterCaCertificate,
                host: cluster.master.externalV4Endpoint,
                token: client.iamToken
            });
            const kubectlProvider = new KubectlProvider(scope, `${_cId}--kubectl-provider`, {
                alias: `${_cId}--kubectl`,
                host: cluster.master.externalV4Endpoint,
                clusterCaCertificate: cluster.master.clusterCaCertificate,
                token: client.iamToken,
                loadConfigFile: false
            });

            new K8sAddons(
                scope,
                `${_cId}__addons`,
                _cId,
                helmProvider,
                k8sProvider,
                kubectlProvider,
                item.addons,
                this.staticIps,
                this.staticAccessKeys,
                this.accountKeys,
                this.buckets
            );
        });

        const clustersOutput : KubernetesClustersOutputMap = {};
        for(const key in this.clusters){
            const _val = this.clusters[key];
            clustersOutput[key] = {
                name: _val.name,
                endpoint: _val.master.externalV4Endpoint,
                caCert: _val.master.clusterCaCertificate
            }
        }
        new TerraformOutput(scope, 'k8s_clusters', {
            value: clustersOutput
        });
    }

}