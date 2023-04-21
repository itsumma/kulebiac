import {Construct} from "constructs";
import {ComputeInstance} from "../../.gen/providers/yandex/compute-instance";
import {readfile} from "../../core/readfile";
import {StoreInstances} from "../../core/interfaces/yc/store";
import {Instance} from "../../core/interfaces/yc/instances";

export class Instances extends Construct{
    public instances: StoreInstances = {};

    constructor(
        scope: Construct,
        name: string,
        instances: Instance[]
    ) {
        super(scope, name);

        const __defaultParams = {
            platformId: 'standard-v2',
            resources: {
                cores: 2,
                memory: 2,
                coreFraction: 100
            },
            bootDiskSize: 10,
            isPublic: false,
            allowStoppingForUpdate: false,
            zone: 'ru-central1-a'
        }

        instances.forEach((item: Instance) => {
            const _iId = item.name;
            this.instances[_iId] = new ComputeInstance(scope, _iId, {
                name: item.name,
                hostname: item.name,
                platformId: item.platformId !== undefined ? item.platformId : __defaultParams.platformId,
                zone: item.zone,
                bootDisk: {
                    initializeParams: {
                        imageId: item.imageId,
                        name: `${item.name}--boot`,
                        size: item.bootDiskSize !== undefined ? item.bootDiskSize : __defaultParams.bootDiskSize
                    }
                },
                networkInterface: [
                    {
                        subnetId: item.subnetId,
                        nat: item.isPublic !== undefined ? item.isPublic : __defaultParams.isPublic,
                        natIpAddress: item.publicStaticIp,
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
                    "user-data" : readfile(item.userDataKey)
                }


            })
        });
    }
}