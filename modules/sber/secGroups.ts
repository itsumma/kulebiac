import {Construct} from "constructs";
import {StoreSecGroups} from "../../core/interfaces/sber/store";
import {SecGroup, SecGroupRule} from "../../core/interfaces/sber/secGroup";
import {NetworkingSecgroup} from "../../.gen/providers/sbercloud/networking-secgroup";
import {NetworkingSecgroupRule} from "../../.gen/providers/sbercloud/networking-secgroup-rule";

export class SecGroups extends Construct{
    public secGroups : StoreSecGroups = {};

    constructor(
        scope: Construct,
        name: string,
        secGroups: SecGroup[]
    ) {
        super(scope, name);

        const __defaults = {
            ethertype: "IPv4",
            protocol: "tcp"
        }

        secGroups.forEach((item: SecGroup) => {
            const _sId = item.name;

            const secGroup = new NetworkingSecgroup(scope, _sId, {
                name: item.name
            });
            this.secGroups[_sId] = secGroup;

            item.rules.forEach((rule: SecGroupRule, _key) => {
                const _rId = `${_sId}--${_key}`;
                new NetworkingSecgroupRule(scope, _rId, {
                    securityGroupId: secGroup.id,
                    direction: rule.direction,
                    ethertype: rule.ethertype ? rule.ethertype : __defaults.ethertype,
                    protocol: rule.protocol ? rule.protocol : __defaults.protocol,
                    remoteIpPrefix: rule.remoteCidr,
                    portRangeMin: rule.portRangeMin,
                    portRangeMax: rule.portRangeMax,
                    ports: rule.ports
                })
            })
        });
    }
}