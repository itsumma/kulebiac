import {Construct} from "constructs";
import {
    StaticIp as StaticIpsInterface,
    StaticIpsOutputMap
} from "../../core/interfaces/yc/staticIps";
import {VpcAddress} from "../../.gen/providers/yandex/vpc-address";
import {TerraformOutput} from "cdktf";
import {StoreStaticIps} from "../../core/interfaces/yc/store";
import {LabelsInterface} from "../../core/labels";

export class StaticIps extends Construct{
    public staticIps: StoreStaticIps = {}

    constructor(
        scope: Construct,
        name: string,
        staticIps: StaticIpsInterface[],
        defaultLabels: LabelsInterface = {}
    ) {
        super(scope, name);

        const __defaults = {
            zone: "ru-central1-a"
        }

        staticIps.forEach((item: StaticIpsInterface) => {
            const _sipId = item.name;
            const _staticIpLabels = item.labels !== undefined ? item.labels : {};
            this.staticIps[_sipId] = new VpcAddress(scope, _sipId, {
                name: item.name,
                externalIpv4Address: {
                    zoneId: item.zone ? item.zone : __defaults.zone
                },
                labels: {...defaultLabels, ..._staticIpLabels}
            })
        });

        const staticIpsOutput: StaticIpsOutputMap = {};
        for(const key in this.staticIps){
            const _val = this.staticIps[key];
            staticIpsOutput[key] = {
                ip: _val.externalIpv4Address.address
            }
        }
        new TerraformOutput(scope, 'static_ips_out', {
            value: staticIpsOutput
        });
    }
}