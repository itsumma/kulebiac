import {Construct} from "constructs";
import {ComputeInstance} from "../../.gen/providers/yandex/compute-instance";
import {readfile} from "../../core/readfile";
import {StoreInstances, StoreStaticIps, StoreSubnets} from "../../core/interfaces/yc/store";
import {Instance, InstancesOutputMap} from "../../core/interfaces/yc/instances";
import {LabelsInterface} from "../../core/labels";
import {TerraformOutput} from "cdktf";

export class Instances extends Construct{
    public instances: StoreInstances = {};

    private readonly subnets: StoreSubnets = {};
    private readonly staticIps: StoreStaticIps = {};

    constructor(
        scope: Construct,
        name: string,
        instances: Instance[],
        subnets: StoreSubnets = {},
        staticIps: StoreStaticIps = {},
        defaultLabels: LabelsInterface = {}
    ) {
        super(scope, name);

        this.subnets = subnets;
        this.staticIps = staticIps;

        const __defaultParams = {
            platformId: 'standard-v2',
            resources: {
                cores: 2,
                memory: 2,
                coreFraction: 100
            },
            bootDiskSize: 30,
            bootDiskType: 'network-hdd',
            isPublic: false,
            allowStoppingForUpdate: false,
            zone: 'ru-central1-a',
            userData: 'core/data/cloud_configs/default.yaml'
        }

        instances.forEach((item: Instance) => {
            const _iId = item.name;

            const _instanceLabels = item.labels !== undefined ? item.labels : {};
            this.instances[_iId] = new ComputeInstance(scope, _iId, {
                name: item.name,
                hostname: item.name,
                platformId: item.platformId !== undefined ? item.platformId : __defaultParams.platformId,
                zone: this.subnets[`${item.network}__${item.subnet}`].zone,
                bootDisk: {
                    initializeParams: {
                        imageId: item.imageId,
                        name: `${item.name}--boot`,
                        size: item.bootDiskSize !== undefined ? item.bootDiskSize : __defaultParams.bootDiskSize,
                        type: item.bootDiskType !== undefined ? item.bootDiskType : __defaultParams.bootDiskType
                    }
                },
                networkInterface: [
                    {
                        subnetId: this.subnets[`${item.network}__${item.subnet}`].id,
                        nat: item.isPublic !== undefined ? item.isPublic : __defaultParams.isPublic,
                        natIpAddress: item.staticIp !== undefined ? this.staticIps[item.staticIp].externalIpv4Address.address : undefined,
                        securityGroupIds: item.securityGroup !== undefined ? [item.securityGroup] : []
                    }
                ],

                resources: {
                    cores: item.resources !== undefined ? (item.resources.cores !== undefined ? item.resources.cores : __defaultParams.resources.cores) : __defaultParams.resources.cores,
                    memory: item.resources !== undefined ? (item.resources.memory !== undefined ? item.resources.memory : __defaultParams.resources.cores) : __defaultParams.resources.cores,
                    coreFraction: item.resources !== undefined ? (item.resources.coreFraction !== undefined ? item.resources.coreFraction : __defaultParams.resources.coreFraction) : __defaultParams.resources.coreFraction
                },
                allowStoppingForUpdate: item.allowStoppingForUpdate !== undefined ? item.allowStoppingForUpdate : __defaultParams.allowStoppingForUpdate,
                metadata:{
                    "user-data" : readfile(item.userData !== undefined ? item.userData : __defaultParams.userData)
                },
                labels : {...defaultLabels, ..._instanceLabels}
            })
        });

        const instancesOutput: InstancesOutputMap = {};
        for(const key in this.instances){
            const _val = this.instances[key];
            instancesOutput[key] = {
                fqdn : _val.fqdn,
                privateIp: _val.networkInterface.get(0).ipAddress,
                publicIp: _val.networkInterface.get(0).natIpAddress
            }
        }
        new TerraformOutput(scope, `${name}__output`, {
            value: instancesOutput
        })
    }
}