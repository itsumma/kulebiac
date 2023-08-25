import {Construct} from "constructs";
import {
    StoreInstanceGroups,
    StoreNetworkLoadBalancers,
    StoreStaticIps,
    StoreSubnets
} from "../../core/interfaces/yc/store";
import {NetworkLoadBalancer, NetworkLoadBalancerListener} from "../../core/interfaces/yc/networkLoadBalancer";
import {LabelsInterface} from "../../core/labels";
import {
    LbNetworkLoadBalancer,
    LbNetworkLoadBalancerAttachedTargetGroup
} from "../../.gen/providers/yandex/lb-network-load-balancer";

export class NetworkLoadBalancers extends Construct{
    public networkLoadBalancers: StoreNetworkLoadBalancers = {};

    private readonly subnets: StoreSubnets = {};
    private readonly instanceGroups: StoreInstanceGroups = {};
    private readonly staticIps: StoreStaticIps = {};

    constructor(
        scope: Construct,
        name: string,
        networkLoadBalancers: NetworkLoadBalancer[],
        subnets: StoreSubnets = {},
        instanceGroups: StoreInstanceGroups = {},
        staticIps: StoreStaticIps = {},
        defaultLabels: LabelsInterface = {}
    ) {
        super(scope, name);

        this.subnets = subnets;
        this.instanceGroups = instanceGroups;
        this.staticIps = staticIps;

        const TARGET_GROUP_INSTANCE_GROUP = 'instanceGroup';
        const HEALTHCHECK_TYPE_TCP = 'TCP';
        const HEALTHCHECK_TYPE_HTTP = 'HTTP';

        const LB_INTERNAL = 'internal';
        const LB_EXTERNAL = 'external';

        const __defaults = {
            healthCheck: {
                interval: 15,
                timeout: 5,
                healthyThreshold: 2,
                unhealthyThreshold: 5,
                httpPath: '/'
            },
            listener: {
                ipVersion: 'ipv4'
            }
        }


        networkLoadBalancers.forEach((item: NetworkLoadBalancer) => {
            const _nlbId = item.name;
            const _nlbLabels = item.labels ? item.labels : {};

            let __targetGroups : LbNetworkLoadBalancerAttachedTargetGroup[] = [];
            switch (item.targetGroupRef.resourceType){
                case TARGET_GROUP_INSTANCE_GROUP:
                    const __targetGroupId = this.instanceGroups[item.targetGroupRef.resourceName].loadBalancer.targetGroupId;
                    __targetGroups = [{
                        targetGroupId: __targetGroupId,
                        healthcheck: [{
                            name: `${item.name}-lb-healthcheck`,
                            interval: item.targetGroupRef.healthCheck.interval ? item.targetGroupRef.healthCheck.interval: __defaults.healthCheck.interval,
                            timeout: item.targetGroupRef.healthCheck.timeout ? item.targetGroupRef.healthCheck.timeout : __defaults.healthCheck.timeout,
                            healthyThreshold: item.targetGroupRef.healthCheck.healthyThreshold ? item.targetGroupRef.healthCheck.healthyThreshold : __defaults.healthCheck.healthyThreshold,
                            unhealthyThreshold: item.targetGroupRef.healthCheck.unhealthyThreshold ? item.targetGroupRef.healthCheck.unhealthyThreshold : __defaults.healthCheck.unhealthyThreshold,

                            tcpOptions: item.targetGroupRef.healthCheck.type === HEALTHCHECK_TYPE_TCP ? {
                                port: item.targetGroupRef.healthCheck.port
                            } : undefined,

                            httpOptions: item.targetGroupRef.healthCheck.type === HEALTHCHECK_TYPE_HTTP ? {
                                port: item.targetGroupRef.healthCheck.port,
                                path: item.targetGroupRef.healthCheck.path ? item.targetGroupRef.healthCheck.path : __defaults.healthCheck.httpPath
                            } : undefined
                        }]
                    }]
                    break;
            }

            this.networkLoadBalancers[_nlbId] = new LbNetworkLoadBalancer(scope, _nlbId, {
                name: item.name,
                type: item.type,

                listener: item.listeners.map((listener: NetworkLoadBalancerListener) => {
                    return {
                        name: listener.name,
                        port: listener.port,
                        targetPort: listener.targetPort,
                        protocol: listener.protocol,

                        internalAddressSpec: item.type === LB_INTERNAL && listener.internalAddress ? {
                            subnetId: this.subnets[`${listener.internalAddress.network}__${listener.internalAddress.subnet}`].id,
                            ipVersion: listener.internalAddress.ipVersion ? listener.internalAddress.ipVersion : __defaults.listener.ipVersion,
                            address: listener.internalAddress.address
                        } : undefined,

                        externalAddressSpec: item.type === LB_EXTERNAL && listener.externalAddress ? {
                            address: listener.externalAddress.address ? this.staticIps[listener.externalAddress.address].externalIpv4Address.address : undefined,
                            ipVersion: listener.externalAddress.ipVersion ? listener.externalAddress.ipVersion : __defaults.listener.ipVersion
                        } : undefined
                    }
                }),

                attachedTargetGroup: __targetGroups,

                labels: {..._nlbLabels, ...defaultLabels}

            })
        })
    }
}