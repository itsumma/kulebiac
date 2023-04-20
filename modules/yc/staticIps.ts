import {Construct} from "constructs";
import {
    StaticIp as StaticIpsInterface,
    StaticIpsOutputMap
} from "../../core/interfaces/yc/staticIps";
import {VpcAddress} from "../../.gen/providers/yandex/vpc-address";
import {TerraformOutput} from "cdktf";
import {StoreStaticIps} from "../../core/interfaces/yc/store";

export class StaticIps extends Construct{
    public staticIps: StoreStaticIps = {}

    constructor(
        scope: Construct,
        name: string,
        staticIps: StaticIpsInterface[]
    ) {
        super(scope, name);

        staticIps.forEach((item: StaticIpsInterface) => {
            const _sipId = item.name;

            this.staticIps[_sipId] = new VpcAddress(scope, _sipId, {
                name: item.name,
                externalIpv4Address: {
                    zoneId: item.zone
                }
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