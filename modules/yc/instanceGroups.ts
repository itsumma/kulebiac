import {Construct} from "constructs";
import {
    StoreFolderRoles,
    StoreInstanceGroups,
    StoreServiceAccounts,
    StoreSubnets,
    StoreVpcs
} from "../../core/interfaces/yc/store";
import {InstanceGroup, InstanceGroupInstanceTemplateDisk} from "../../core/interfaces/yc/instanceGroup";
import {LabelsInterface} from "../../core/labels";
import {ComputeInstanceGroup} from "../../.gen/providers/yandex/compute-instance-group";
import {generateDepsArr} from "../../core/deps";
import {readfile} from "../../core/readfile";
import {Fn} from "cdktf";
import * as path from "path";

export class InstanceGroups extends Construct{

    public instanceGroups : StoreInstanceGroups = {};

    private readonly networks : StoreVpcs = {};
    private readonly internalSubnets: StoreSubnets = {};
    private readonly publicSubnets: StoreSubnets = {};
    private readonly serviceAccounts: StoreServiceAccounts = {};
    private readonly folderRoles: StoreFolderRoles = {};

    constructor(
        scope: Construct,
        name: string,
        instanceGroups: InstanceGroup[],
        networks: StoreVpcs = {},
        internalSubnets: StoreSubnets = {},
        publicSubnets: StoreSubnets = {},
        serviceAccounts: StoreServiceAccounts = {},
        folderRoles: StoreFolderRoles = {},
        defaultLabels: LabelsInterface = {}
    ) {
        super(scope, name);

        this.networks = networks;
        this.internalSubnets = internalSubnets;
        this.publicSubnets = publicSubnets;
        this.serviceAccounts = serviceAccounts;
        this.folderRoles = folderRoles;

        const __defaults = {
            deployPolicy: {
                maxUnavailable: 1,
                maxExpansion: 1,
                maxDeleting: 1,
                maxCreating: 3,
                startupDuration: 60,
                strategy: 'proactive'
            },
            scalePolicy: {
                size: 1,
                initialSize: 3,
                measurementDuration: 60,
                cpuUtilizationTarget: 50,
                minZoneSize: 1,
                maxSize: 6,
                warmupDuration: 60,
                stabilizationDuration: 60
            },
            instanceTemplate: {
                userData: 'core/data/cloud_configs/default.yaml',
                nat: false,
                platformId: "standard-v1",
                disk: {
                    mode: "READ_WRITE",
                    size: 30,
                    type: "network-ssd"
                },
                resources: {
                    memory: 4,
                    cores: 2,
                    coreFraction: 100
                }
            },
            healthCheck: {
                interval: 15,
                timeout: 5,
                healthyThreshold: 2,
                unhealthyThreshold: 5,
                httpPath: '/'
            },
            loadBalancer: {
                maxOpeningTrafficDuration: 5
            }
        }


        const HEALTHCHECK_TYPE_TCP = 'TCP';
        const HEALTHCHECK_TYPE_HTTP = 'HTTP';

        instanceGroups.forEach((item: InstanceGroup) => {
            const _igId = item.name;

            const __subnets = item.isPublic ? this.publicSubnets : this.internalSubnets;

            const _igLabels = item.labels ? item.labels : {};
            const __metadata : {
                [key: string] : string
            } = {
                "user-data": Fn.chomp(Fn.file(path.resolve(process.cwd(), item.instanceTemplate.userData ? item.instanceTemplate.userData : __defaults.instanceTemplate.userData)))
            }
            if(item.instanceTemplate.dockerDeclaration){
                __metadata["docker-container-declaration"] = Fn.chomp(Fn.file(path.resolve(process.cwd(), item.instanceTemplate.dockerDeclaration)));
            }
            if(item.instanceTemplate.dockerComposeDeclaration){
                __metadata["docker-compose"] = Fn.chomp(Fn.file(path.resolve(process.cwd(), item.instanceTemplate.dockerComposeDeclaration)));
            }

            this.instanceGroups[_igId] = new ComputeInstanceGroup(scope, _igId, {
                dependsOn: [...generateDepsArr(this.serviceAccounts), ...generateDepsArr(this.folderRoles)],
                labels: {...defaultLabels, ..._igLabels},

                name: item.name,
                serviceAccountId: this.serviceAccounts[item.sa].id,

                allocationPolicy: {
                    zones: [__subnets[`${item.network}__${item.subnet}`].zone]
                },

                deployPolicy: item.deployPolicy ? {
                    maxUnavailable: item.deployPolicy.maxUnavailable ? item.deployPolicy.maxUnavailable : __defaults.deployPolicy.maxUnavailable,
                    maxExpansion: item.deployPolicy.maxExpansion ? item.deployPolicy.maxExpansion : __defaults.deployPolicy.maxExpansion,
                    maxDeleting: item.deployPolicy.maxDeleting ? item.deployPolicy.maxDeleting : __defaults.deployPolicy.maxDeleting,
                    maxCreating: item.deployPolicy.maxCreating ? item.deployPolicy.maxCreating : __defaults.deployPolicy.maxCreating,
                    startupDuration: item.deployPolicy.startupDuration ? item.deployPolicy.startupDuration : __defaults.deployPolicy.startupDuration,
                    strategy: item.deployPolicy.strategy ? item.deployPolicy.strategy : __defaults.deployPolicy.strategy
                } : __defaults.deployPolicy,

                scalePolicy: {
                    fixedScale: !item.scalePolicy.autoScaleMode ? {
                        size: item.scalePolicy.size ? item.scalePolicy.size : __defaults.scalePolicy.size
                    } : undefined,

                    autoScale: item.scalePolicy.autoScaleMode ? {
                        initialSize: item.scalePolicy.initialSize ? item.scalePolicy.initialSize : __defaults.scalePolicy.initialSize,
                        maxSize: item.scalePolicy.maxSize ? item.scalePolicy.maxSize : __defaults.scalePolicy.maxSize,
                        measurementDuration: item.scalePolicy.measurementDuration ? item.scalePolicy.measurementDuration : __defaults.scalePolicy.measurementDuration,
                        cpuUtilizationTarget: item.scalePolicy.cpuUtilizationTarget ? item.scalePolicy.cpuUtilizationTarget : __defaults.scalePolicy.cpuUtilizationTarget,
                        minZoneSize: item.scalePolicy.minZoneSize ? item.scalePolicy.minZoneSize : __defaults.scalePolicy.minZoneSize,
                        warmupDuration: item.scalePolicy.warmupDuration ? item.scalePolicy.warmupDuration : __defaults.scalePolicy.warmupDuration,
                        stabilizationDuration: item.scalePolicy.stabilizationDuration ? item.scalePolicy.stabilizationDuration : __defaults.scalePolicy.stabilizationDuration
                    } : undefined
                },

                instanceTemplate: {
                    name: item.instanceTemplate.name,
                    labels: {...defaultLabels, ...item.labels},
                    hostname: item.instanceTemplate.hostName,
                    platformId: item.instanceTemplate.platformId ? item.instanceTemplate.platformId : __defaults.instanceTemplate.platformId,

                    serviceAccountId: this.serviceAccounts[item.sa].id,
                    metadata: __metadata,

                    networkInterface: [{
                        networkId: this.networks[item.network].id,
                        subnetIds: [__subnets[`${item.network}__${item.subnet}`].id],
                        nat: item.isPublic
                    }],

                    schedulingPolicy: item.instanceTemplate.preemptible ? {
                        preemptible: item.instanceTemplate.preemptible
                    } : undefined,

                    bootDisk: {
                        mode: item.instanceTemplate.bootDisk.mode ? item.instanceTemplate.bootDisk.mode : __defaults.instanceTemplate.disk.mode,
                        initializeParams: {
                            imageId: item.instanceTemplate.bootDisk.imageId,
                            snapshotId: item.instanceTemplate.bootDisk.snapshotId,
                            size: item.instanceTemplate.bootDisk.size ? item.instanceTemplate.bootDisk.size : __defaults.instanceTemplate.disk.size,
                            type: item.instanceTemplate.bootDisk.type ? item.instanceTemplate.bootDisk.type : __defaults.instanceTemplate.disk.type
                        }
                    },

                    secondaryDisk: item.instanceTemplate.secondaryDisks ?
                        item.instanceTemplate.secondaryDisks.map((disk: InstanceGroupInstanceTemplateDisk) => {
                            return {
                                mode: disk.mode ? disk.mode : __defaults.instanceTemplate.disk.mode,
                                initializeParams: {
                                    imageId: disk.imageId,
                                    snapshotId: disk.snapshotId,
                                    size: disk.size ? disk.size : __defaults.instanceTemplate.disk.size,
                                    type: disk.type ? disk.type : __defaults.instanceTemplate.disk.type
                                }
                            }
                        })
                        : undefined,

                    resources: item.instanceTemplate.resources ? {
                        cores: item.instanceTemplate.resources.cores ? item.instanceTemplate.resources.cores : __defaults.instanceTemplate.resources.cores,
                        memory: item.instanceTemplate.resources.memory ? item.instanceTemplate.resources.memory : __defaults.instanceTemplate.resources.memory,
                        coreFraction: item.instanceTemplate.resources.coreFraction ? item.instanceTemplate.resources.coreFraction : __defaults.instanceTemplate.resources.coreFraction
                    } : __defaults.instanceTemplate.resources

                },

                healthCheck: item.healthCheck ? [{
                    interval: item.healthCheck.interval ? item.healthCheck.interval : __defaults.healthCheck.interval,
                    timeout: item.healthCheck.timeout ? item.healthCheck.timeout : __defaults.healthCheck.timeout,
                    healthyThreshold: item.healthCheck.healthyThreshold ? item.healthCheck.healthyThreshold : __defaults.healthCheck.healthyThreshold,
                    unhealthyThreshold: item.healthCheck.unhealthyThreshold ? item.healthCheck.unhealthyThreshold : __defaults.healthCheck.unhealthyThreshold,

                    tcpOptions: item.healthCheck.type === HEALTHCHECK_TYPE_TCP ? {
                        port: item.healthCheck.port
                    } : undefined,

                    httpOptions: item.healthCheck.type === HEALTHCHECK_TYPE_HTTP ? {
                        port: item.healthCheck.port,
                        path: item.healthCheck.path ? item.healthCheck.path : __defaults.healthCheck.httpPath
                    } : undefined

                }] : undefined,

                loadBalancer: item.lbTargetGroup && item.lbTargetGroup.enabled ? {
                    targetGroupName: item.lbTargetGroup.name ? item.lbTargetGroup.name : `${item.name}-nlb-target-group`,
                    targetGroupDescription: item.lbTargetGroup.description,
                    maxOpeningTrafficDuration: item.lbTargetGroup.maxOpeningTrafficDuration ? item.lbTargetGroup.maxOpeningTrafficDuration : __defaults.loadBalancer.maxOpeningTrafficDuration

                } : undefined

            });
        })
    }
}