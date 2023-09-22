import {Construct} from "constructs";
import {
    StoreElasticIps, StoreKeyPairs,
    StoreKubernetesClusters,
    StoreKubernetesNodeGroups,
    StoreSubnets,
    StoreVpcs
} from "../../core/interfaces/sber/store";
import {
    KubernetesCluster,
    KubernetesClustersOutputMap,
    KubernetesNodeGroup, KubernetesNodeGroupsOutputMap,
    KubernetesNodeGroupVolume
} from "../../core/interfaces/sber/k8s";
import {CceCluster} from "../../.gen/providers/sbercloud/cce-cluster";
import {LabelsInterface} from "../../core/labels";
import {CceNodePool} from "../../.gen/providers/sbercloud/cce-node-pool";
import {Password} from "../../.gen/providers/random/password";
import {Fn, ITerraformDependable, TerraformOutput} from "cdktf";
import {HelmProvider} from "@cdktf/provider-helm/lib/provider";
import {KubernetesProvider} from "@cdktf/provider-kubernetes/lib/provider";
import {KubectlProvider} from "../../.gen/providers/kubectl/provider";
import {K8sAddons} from "./k8sAddons";
import {generateDepsArr} from "../../core/deps";

export class K8s extends Construct{
    public clusters: StoreKubernetesClusters = {};
    public nodeGroups: StoreKubernetesNodeGroups = {};

    private readonly networks: StoreVpcs = {};
    private readonly subnets: StoreSubnets = {};
    private readonly elasticIps: StoreElasticIps = {};
    private readonly keyPairs: StoreKeyPairs = {};

    constructor(
        scope: Construct,
        name: string,
        clusters: KubernetesCluster[],
        networks: StoreVpcs = {},
        subnets: StoreSubnets = {},
        elasticIps: StoreElasticIps = {},
        keyPairs: StoreKeyPairs = {},
        defaultLabels: LabelsInterface = {}
    ) {
        super(scope, name);

        this.networks = networks;
        this.subnets = subnets;
        this.elasticIps = elasticIps;
        this.keyPairs = keyPairs;

        const __defaultsMaster = {
            version: "1.25",
            containerNetworkType: "overlay_l2",
            clusterType: "VirtualMachine",
            flavorId: "cce.s1.small",
            availabilityZone: "ru-moscow-1a"
        }

        const __defaultsNodes = {
            flavorId: "s7n.large.2",
            type: "vm",
            os: "CentOS 7.6",
            priority: 1,
            runtime: "containerd",
            nodeLabels: {},
            nodeTaints: [],
            rootVolume: {
                size: 40,
                type: "SAS"
            },
            dataVolume: {
                size: 100,
                type: "SAS"
            },
            scalePolicy: {
                autoScaleMode: false,
                initialSize: 3,
                autoScaleMin: 3,
                autoScaleMax: 6,
                downCoolDownTimeMinutes: 1
            }
        }

        const AUTH_METHOD_KEY_PAIR = 'keyPair';
        const AUTH_METHOD_PASSWORD = 'password';

        clusters.forEach((item: KubernetesCluster) => {
            const _cId = item.name;
            const _clusterLabels = item.labels ? item.labels : {};

            const cluster = new CceCluster(scope, _cId, {
                name: item.name,
                flavorId: item.flavorId ? item.flavorId : __defaultsMaster.flavorId,
                vpcId: this.networks[item.network].id,
                subnetId: this.subnets[`${item.network}__${item.subnet}`].id,

                clusterType: item.clusterType ? item.clusterType : __defaultsMaster.clusterType,
                containerNetworkType: item.containerNetworkType ? item.containerNetworkType : __defaultsMaster.containerNetworkType,

                masters: [{
                    availabilityZone: item.availabilityZone ? item.availabilityZone : __defaultsMaster.availabilityZone
                }],
                eip: item.elasticIp ? this.elasticIps[item.elasticIp].address : undefined,
                tags: {...defaultLabels, ..._clusterLabels}
            });
            this.clusters[_cId] = cluster;

            const nodePools : CceNodePool[] = [];
            item.nodeGroups.forEach((nodeGroup: KubernetesNodeGroup) => {
                const _nGId = `${_cId}__${nodeGroup.name}`;

                const __pass = nodeGroup.authConfig.method === AUTH_METHOD_PASSWORD ? (
                    nodeGroup.authConfig.password ? nodeGroup.authConfig.password : new Password(scope, `${_nGId}--pass`,{
                        length: 16,
                        minLower: 1,
                        minUpper: 1,
                        minNumeric: 1,
                        minSpecial: 1,
                        special: true
                    }).result
                )
                 : undefined;

                const nodePool = new CceNodePool(scope, _nGId, {
                    clusterId: cluster.id,
                    name: nodeGroup.name,

                    flavorId: nodeGroup.flavorId ? nodeGroup.flavorId : __defaultsNodes.flavorId,
                    type: nodeGroup.type ? nodeGroup.type : __defaultsNodes.type,
                    os: nodeGroup.os ? nodeGroup.os : __defaultsNodes.os,
                    availabilityZone: item.availabilityZone ? item.availabilityZone : __defaultsMaster.availabilityZone,
                    runtime: nodeGroup.runtime ? nodeGroup.runtime : __defaultsNodes.runtime,
                    priority: nodeGroup.priority ? nodeGroup.priority : __defaultsNodes.priority,

                    initialNodeCount: nodeGroup.scalePolicy && nodeGroup.scalePolicy.initialSize ? nodeGroup.scalePolicy.initialSize : __defaultsNodes.scalePolicy.initialSize,
                    scallEnable: nodeGroup.scalePolicy && nodeGroup.scalePolicy.autoScaleMode ? nodeGroup.scalePolicy.autoScaleMode : __defaultsNodes.scalePolicy.autoScaleMode,
                    minNodeCount: nodeGroup.scalePolicy && nodeGroup.scalePolicy.autoScaleMin ? nodeGroup.scalePolicy.autoScaleMin : __defaultsNodes.scalePolicy.autoScaleMin,
                    maxNodeCount: nodeGroup.scalePolicy && nodeGroup.scalePolicy.autoScaleMax ? nodeGroup.scalePolicy.autoScaleMax : __defaultsNodes.scalePolicy.autoScaleMax,
                    scaleDownCooldownTime: nodeGroup.scalePolicy && nodeGroup.scalePolicy.downCoolDownTimeMinutes ? nodeGroup.scalePolicy.downCoolDownTimeMinutes : __defaultsNodes.scalePolicy.downCoolDownTimeMinutes,

                    rootVolume: nodeGroup.rootVolume ? {
                        size: nodeGroup.rootVolume.size ? nodeGroup.rootVolume.size : __defaultsNodes.rootVolume.size,
                        volumetype: nodeGroup.rootVolume.type ? nodeGroup.rootVolume.type : __defaultsNodes.rootVolume.type
                    } : {
                        size: __defaultsNodes.rootVolume.size,
                        volumetype: __defaultsNodes.rootVolume.type
                    },

                    dataVolumes : nodeGroup.dataVolumes ? (nodeGroup.dataVolumes.map((vol: KubernetesNodeGroupVolume) => {
                        return {
                            size: vol.size ? vol.size : __defaultsNodes.dataVolume.size,
                            volumetype: vol.type ? vol.type : __defaultsNodes.dataVolume.type
                        }
                    })) : [{
                        size: __defaultsNodes.dataVolume.size,
                        volumetype: __defaultsNodes.dataVolume.type
                    }],

                    taints: nodeGroup.nodeTaints ? nodeGroup.nodeTaints : __defaultsNodes.nodeTaints,
                    labels: nodeGroup.nodeLabels ? nodeGroup.nodeLabels : __defaultsNodes.nodeLabels,

                    keyPair: nodeGroup.authConfig.method === AUTH_METHOD_KEY_PAIR && nodeGroup.authConfig.keyPair ? this.keyPairs[nodeGroup.authConfig.keyPair].name : undefined,
                    password: nodeGroup.authConfig.method === AUTH_METHOD_PASSWORD ? __pass : undefined,

                });
                this.nodeGroups[_nGId] = nodePool;
                nodePools.push(nodePool);
            });

            if(item.addons){
                const helmProvider = new HelmProvider(scope, `${_cId}--helm-provider`, {
                    alias: `${_cId}--helm`,
                    kubernetes: {
                        host: `https://${cluster.eip}:5443`,
                        clientCertificate: Fn.base64decode(cluster.certificateUsers.get(0).clientCertificateData),
                        clientKey: Fn.base64decode(cluster.certificateUsers.get(0).clientKeyData),
                        clusterCaCertificate: Fn.base64decode(cluster.certificateClusters.get(0).certificateAuthorityData)
                    }
                });
                const k8sProvider = new KubernetesProvider(scope, `${_cId}--k8s-provider`, {
                    alias: `${_cId}--k8s`,
                    host: `https://${cluster.eip}:5443`,
                    clientCertificate: Fn.base64decode(cluster.certificateUsers.get(0).clientCertificateData),
                    clientKey: Fn.base64decode(cluster.certificateUsers.get(0).clientKeyData),
                    clusterCaCertificate: Fn.base64decode(cluster.certificateClusters.get(0).certificateAuthorityData)
                });
                const kubectlProvider = new KubectlProvider(scope, `${_cId}--kubectl-provider`, {
                    alias: `${_cId}--kubectl`,
                    host: `https://${cluster.eip}:5443`,
                    clientCertificate: Fn.base64decode(cluster.certificateUsers.get(0).clientCertificateData),
                    clientKey: Fn.base64decode(cluster.certificateUsers.get(0).clientKeyData),
                    clusterCaCertificate: Fn.base64decode(cluster.certificateClusters.get(0).certificateAuthorityData),
                    loadConfigFile: false
                });

                const __deps = [cluster, ...nodePools] as ITerraformDependable[];

                new K8sAddons(
                    scope,
                    `${_cId}__addons`,
                    _cId,
                    helmProvider,
                    k8sProvider,
                    kubectlProvider,
                    __deps,
                    item.addons,
                    this.subnets
                )
            }


        });

        const clustersOutput: KubernetesClustersOutputMap = {};
        for(const key in this.clusters){
            const _val = this.clusters[key];

            clustersOutput[key] = {
                name: _val.name,
                endpoint: `https://${_val.eip}:5443`,
                clientCertificate: _val.certificateUsers.get(0).clientCertificateData,
                clientKey: _val.certificateUsers.get(0).clientKeyData,
                caCertificate: _val.certificateClusters.get(0).certificateAuthorityData,
                config: _val.kubeConfigRaw
            }
        }
        new TerraformOutput(scope, 'k8s_clusters', {
            value: clustersOutput
        });

        const nodeGroupsOutput: KubernetesNodeGroupsOutputMap = {};
        for(const key in this.nodeGroups){
            const _val = this.nodeGroups[key];

            nodeGroupsOutput[key] = {
                name: _val.name,
                clusterId: _val.clusterId,
                password: _val.password,
                keyPair: _val.keyPair
            };
        }
        new TerraformOutput(scope, 'k8s_node_groups', {
            value: nodeGroupsOutput,
            sensitive: true
        });
    }
}