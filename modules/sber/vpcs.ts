import {Construct} from "constructs";
import {StoreElasticIps, StoreSubnets, StoreVpcs} from "../../core/interfaces/sber/store";
import {Vpc as VpcInterface} from "../../core/interfaces/sber/vpcs";
import {LabelsInterface} from "../../core/labels";
import {Vpc} from "../../.gen/providers/sbercloud/vpc";
import {VpcSubnet} from "../../.gen/providers/sbercloud/vpc-subnet";
import {NatGateway} from "../../.gen/providers/sbercloud/nat-gateway";
import {NatSnatRule} from "../../.gen/providers/sbercloud/nat-snat-rule";

export class Vpcs extends Construct{
    public vpcs: StoreVpcs = {};
    public subnets: StoreSubnets = {};

    private readonly elasticIps: StoreElasticIps = {};

    constructor(
        scope: Construct,
        name: string,
        vpcs: VpcInterface[],
        elasticIps: StoreElasticIps = {},
        defaultLabels: LabelsInterface = {}
    ) {
        super(scope, name);

        this.elasticIps = elasticIps;

        const __defaults = {
            primaryDns: "100.125.13.59",
            secondaryDns: "8.8.8.8",
            natSpec: "1"
        }

        vpcs.forEach((item: VpcInterface) => {
            const _vpcId = item.name;
            const _vpcLabels = item.labels ? item.labels : {};
            const vpc = new Vpc(scope, _vpcId, {
                name: item.name,
                cidr: item.cidr,
                tags: {...defaultLabels, ..._vpcLabels}
            });

            this.vpcs[_vpcId] = vpc;

            const _pubSKey = `${_vpcId}__${item.publicSubnet.name}`;
            const _pubSLabels = item.publicSubnet.labels ? item.publicSubnet.labels : {};
            const publicSubnet = new VpcSubnet(scope, _pubSKey, {
                vpcId: vpc.id,
                name: item.publicSubnet.name,
                cidr: item.publicSubnet.cidr,
                gatewayIp: item.publicSubnet.gatewayIp,

                primaryDns: item.publicSubnet.primaryDns ? item.publicSubnet.primaryDns : __defaults.primaryDns,
                secondaryDns: item.publicSubnet.secondaryDns ? item.publicSubnet.secondaryDns : __defaults.secondaryDns,
                tags: {...defaultLabels, ..._pubSLabels}
            });
            this.subnets[_pubSKey] = publicSubnet;

            const _intSKey = `${_vpcId}__${item.internalSubnet.name}`;
            const _intSLabels = item.internalSubnet.labels ? item.internalSubnet.labels : {};
            const internalSubnet = new VpcSubnet(scope, _intSKey, {
                vpcId: vpc.id,
                name: item.internalSubnet.name,
                cidr: item.internalSubnet.cidr,
                gatewayIp: item.internalSubnet.gatewayIp,

                primaryDns: item.internalSubnet.primaryDns ? item.internalSubnet.primaryDns : __defaults.primaryDns,
                secondaryDns: item.internalSubnet.secondaryDns ? item.internalSubnet.secondaryDns : __defaults.secondaryDns,
                tags: {...defaultLabels, ..._intSLabels}
            });
            this.subnets[_intSKey] = internalSubnet;

            if(item.nat && item.nat.enabled){
                const natKey = `${item.name}--nat`;

                const nat = new NatGateway(scope, natKey, {
                    name: natKey,
                    vpcId: vpc.id,
                    subnetId: publicSubnet.id,
                    spec: item.nat.spec ? item.nat.spec : __defaults.natSpec
                });

                const _pubSnatKey = `${_vpcId}__${_pubSKey}__snat`;
                new NatSnatRule(scope, _pubSnatKey, {
                    natGatewayId: nat.id,
                    subnetId: publicSubnet.id,
                    floatingIpId: this.elasticIps[item.nat.elasticIp].id
                });

                const _intSnatKey = `${_vpcId}__${_intSKey}__snat`;
                new NatSnatRule(scope, _intSnatKey, {
                    natGatewayId: nat.id,
                    subnetId: internalSubnet.id,
                    floatingIpId: this.elasticIps[item.nat.elasticIp].id
                });
            }


        });
    }
}