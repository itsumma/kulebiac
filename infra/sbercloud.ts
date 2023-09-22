import {Construct} from "constructs";
import {SbercloudStackConfig} from "../core/interfaces/sber/stackConfig";
import {LabelsInterface} from "../core/labels";
import {StaticIps} from "../modules/sber/staticIps";
import {Vpcs} from "../modules/sber/vpcs";
import {K8s} from "../modules/sber/k8s";
import {KeyPairs} from "../modules/sber/keyPairs";

export class SbercloudInfra extends Construct{
    constructor(
        scope: Construct,
        name: string,
        config: SbercloudStackConfig,
        defaultLabels: LabelsInterface = {}
    ) {
        super(scope, name);

        let _staticIpsModule : StaticIps | null = null;
        if(config.staticIpConfig){
            _staticIpsModule = new StaticIps(
                scope,
                'static_ips',
                config.staticIpConfig,
                defaultLabels
            )
        }

        let _keyPairsModule: KeyPairs | null = null;
        if(config.keyPairs){
            _keyPairsModule = new KeyPairs(
                scope,
                'key_pairs',
                config.keyPairs
            )
        }

        let _vpcsModule: Vpcs | null = null;
        if(config.vpcs){
            _vpcsModule = new Vpcs(
                scope,
                'vpcs',
                config.vpcs,
                _staticIpsModule ? _staticIpsModule.elasticIps : {},
                defaultLabels
            )
        }

        let _k8sModule: K8s | null = null;
        if(
            config.k8sClusters
            &&
            _vpcsModule
        ){
            _k8sModule = new K8s(
                scope,
                'k8s',
                config.k8sClusters,
                _vpcsModule.vpcs,
                _vpcsModule.subnets,
                _staticIpsModule ? _staticIpsModule.elasticIps : {},
                _keyPairsModule ? _keyPairsModule.keyPairs : {},
                defaultLabels
            )
        }
    }
}