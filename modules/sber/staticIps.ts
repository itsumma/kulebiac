import {Construct} from "constructs";
import {SharedBandwidth, StaticIp, StaticIpConfig, StaticIpsOutputMap} from "../../core/interfaces/sber/staticIp";
import {LabelsInterface} from "../../core/labels";
import {StoreElasticIps, StoreShareBandWidths} from "../../core/interfaces/sber/store";
import {VpcBandwidth, VpcBandwidthConfig} from "../../.gen/providers/sbercloud/vpc-bandwidth";
import {VpcEip} from "../../.gen/providers/sbercloud/vpc-eip";
import {TerraformOutput} from "cdktf";

export class StaticIps extends Construct{
    public shareBandWidths: StoreShareBandWidths = {};
    public elasticIps: StoreElasticIps = {};

    constructor(
        scope: Construct,
        name: string,
        staticIpsConfig: StaticIpConfig,
        defaultLabels: LabelsInterface
    ) {
        super(scope, name);

        const __defaults = {
            bandWidthSize: 10,
            type: "5_bgp",
            chargeMode: "traffic"
        }

        const SHARE_TYPE_PER = "PER";
        const SHARE_TYPE_WHOLE = "WHOLE";

        if (staticIpsConfig.shareBandwidths) {
            staticIpsConfig.shareBandwidths.forEach((item: SharedBandwidth) => {
                const _sKey = item.name;
                this.shareBandWidths[_sKey] = new VpcBandwidth(scope, _sKey, {
                    name: item.name,
                    size: item.size ? item.size : __defaults.bandWidthSize
                })
            })
        }

        if (staticIpsConfig.staticIps) {
            staticIpsConfig.staticIps.forEach((item: StaticIp) => {
                const _iKey = item.name;
                const _iLabels = item.labels ? item.labels : {};

                const __bandwidthData = item.shareType === SHARE_TYPE_PER ? {
                    shareType: SHARE_TYPE_PER,
                    name: item.bandwidthName,
                    size: item.bandwidthSize ? item.bandwidthSize : __defaults.bandWidthSize,
                    chargeMode: item.chargeMode ? item.chargeMode : __defaults.chargeMode
                } : {
                    shareType: SHARE_TYPE_WHOLE,
                    id: this.shareBandWidths[item.bandwidthName].id
                };

                this.elasticIps[_iKey] = new VpcEip(scope, _iKey, {
                    name: item.name,

                    publicip: {
                        type: item.type ? item.type : __defaults.type
                    },
                    bandwidth: __bandwidthData,
                    tags: {...defaultLabels, ..._iLabels}
                })
            })
        }

        const staticIpsOutput: StaticIpsOutputMap = {};
        for(const key in this.elasticIps){
            const _val = this.elasticIps[key];
            staticIpsOutput[key] = {
                ip: _val.publicip.ipAddress
            }
        }
        new TerraformOutput(scope, 'elastic_ips_out', {
            value: staticIpsOutput
        })
    }
}