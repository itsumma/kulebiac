import {Construct} from "constructs";

import {VpcNetwork} from "../../.gen/providers/yandex/vpc-network";
import {VpcSubnet} from "../../.gen/providers/yandex/vpc-subnet";
import {Instances} from "./instances";
import {VpcRouteTable} from "../../.gen/providers/yandex/vpc-route-table";
import {TerraformOutput} from "cdktf";
import {StoreStaticIps, StoreSubnets, StoreVpcs} from "../../core/interfaces/yc/store";
import {Subnet, SubnetsOutputMap, Vpc, VpcsOutputMap} from "../../core/interfaces/yc/vpcs";
import {Instance} from "../../core/interfaces/yc/instances";
import {LabelsInterface} from "../../core/labels";



export class Vpcs extends Construct{

    public vpcs: StoreVpcs = {};
    public publicSubnets: StoreSubnets = {};
    public infraSubnets: StoreSubnets = {};

    private readonly staticIps: StoreStaticIps = {}

    constructor(
        scope: Construct,
        name: string,
        vpcs: Vpc[],
        staticIps: StoreStaticIps = {},
        defaultLabels: LabelsInterface = {}
    ) {
        super(scope, name);
        this.staticIps = staticIps;

        vpcs.forEach((item: Vpc) => {
            const _vpcId = item.name;

            const _vpcLabels = item.labels !== undefined ? item.labels : {};
            const vpc = new VpcNetwork(scope, item.name, {
                name: item.name,
                labels: {...defaultLabels, ..._vpcLabels}
            });
            this.vpcs[_vpcId] = vpc;

            item.publicSubnets.forEach((subnetItem: Subnet) => {
                const _sId = `${item.name}__${subnetItem.name}`;

                const _subnetLabels = subnetItem.labels !== undefined ? subnetItem.labels : {}
                this.publicSubnets[_sId] = new VpcSubnet(scope, _sId, {
                    name: subnetItem.name,
                    networkId: vpc.id,
                    routeTableId: '',
                    v4CidrBlocks: [subnetItem.subnet],
                    zone: subnetItem.zone,
                    labels: {...defaultLabels, ..._subnetLabels}
                })
            });

            let routeTableId = '';

            if(item.natData.enabled && item.natData.params !== undefined){
                const _natName = item.natData.params.name;

                const _natLabels = item.natData.params.labels !== undefined ? item.natData.params.labels : {}
                const _natData : Instance = {
                    name: _natName,
                    imageId: item.natData.params.imageId,
                    bootDiskSize: item.natData.params.bootDiskSize,
                    bootDiskType: item.natData.params.bootDiskType,
                    platformId: item.natData.params.platformId,
                    userData: item.natData.params.userData,
                    isPublic: true,
                    resources: {
                        cores: item.natData.params.cores,
                        memory: item.natData.params.memory,
                        coreFraction: item.natData.params.coreFraction
                    },
                    allowStoppingForUpdate: item.natData.params.allowStoppingForUpdate,
                    network: item.name,
                    subnet: item.natData.params.subnet,
                    staticIp: item.natData.params.staticIp,
                    labels : _natLabels
                }

                const natInstances = new Instances(scope, 'nat_instances', [_natData], this.publicSubnets, this.staticIps, defaultLabels);

                const routeTable = new VpcRouteTable(scope, 'route_table', {
                    networkId: vpc.id,
                    name: `${item.name}__route_table`,

                    staticRoute: [{
                        destinationPrefix: '0.0.0.0/0',
                        nextHopAddress: natInstances.instances[_natName].networkInterface.get(0).ipAddress
                    }],
                    labels: defaultLabels

                });
                routeTableId = routeTable.id;
            }

            item.infraSubnets.forEach((subnetItem: Subnet) => {
                const _sId = `${item.name}__${subnetItem.name}`;

                const _subnetLabels = subnetItem.labels !== undefined ? subnetItem.labels : {};
                this.infraSubnets[_sId] = new VpcSubnet(scope, _sId, {
                    name: subnetItem.name,
                    networkId: vpc.id,
                    routeTableId: routeTableId,
                    v4CidrBlocks: [subnetItem.subnet],
                    zone: subnetItem.zone,
                    labels: {...defaultLabels, ..._subnetLabels}
                })
            });
        });

        const vpcsOutput: VpcsOutputMap = {};
        for(const key in this.vpcs){
            const _val = this.vpcs[key];
            vpcsOutput[key] = {
                networkId: _val.id
            }
        }
        new TerraformOutput(scope, 'vpcs_output', {
            value: vpcsOutput
        });

        const publicSubnetsOutput: SubnetsOutputMap = {};
        for(const key in this.publicSubnets){
            const _val = this.publicSubnets[key];
            publicSubnetsOutput[key] = {
                subnetId: _val.id,
                zone: _val.zone,
                networkId: _val.networkId
            }
        }
        new TerraformOutput(scope, 'public_subnets_output', {
            value: publicSubnetsOutput
        });

        const infraSubnetsOutput: SubnetsOutputMap = {};
        for(const key in this.infraSubnets){
            const _val = this.infraSubnets[key];
            infraSubnetsOutput[key] = {
                subnetId: _val.id,
                zone: _val.zone,
                networkId: _val.networkId
            }
        }
        new TerraformOutput(scope, 'infra_subnets_output', {
            value: infraSubnetsOutput
        });
    }
}