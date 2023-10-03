import {Construct} from "constructs";
import {SbercloudStackConfig} from "../core/interfaces/sber/stackConfig";
import {LabelsInterface} from "../core/labels";
import {StaticIps} from "../modules/sber/staticIps";
import {Vpcs} from "../modules/sber/vpcs";
import {K8s} from "../modules/sber/k8s";
import {KeyPairs} from "../modules/sber/keyPairs";
import {Registries} from "../modules/sber/registries";
import {IamUsers} from "../modules/sber/iamUsers";
import {Buckets} from "../modules/sber/buckets";
import {SecGroups} from "../modules/sber/secGroups";
import {StoreSecGroups} from "../core/interfaces/sber/store";
import {DataSbercloudNetworkingSecgroup} from "../.gen/providers/sbercloud/data-sbercloud-networking-secgroup";
import {Postgres} from "../modules/sber/postgres";

export class SbercloudInfra extends Construct{
    constructor(
        scope: Construct,
        name: string,
        config: SbercloudStackConfig,
        defaultLabels: LabelsInterface = {}
    ) {
        super(scope, name);

        let _iamUsersModule: IamUsers | null = null;
        if(config.iamUsers){
            _iamUsersModule = new IamUsers(
                scope,
                'iam_users',
                config.iamUsers,
                config.projectId
            )
        }

        let _registriesModule: Registries | null = null;
        if(config.registries){
            _registriesModule = new Registries(
                scope,
                'registries',
                config.registries,
                _iamUsersModule ? _iamUsersModule.iamUsers : {}
            )
        }

        let _bucketsModule: Buckets | null = null;
        if(config.buckets){
            _bucketsModule = new Buckets(
                scope,
                'buckets',
                config.buckets
            )
        }

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

        let _secGroupsModule: SecGroups | null = null;
        if(config.secGroups){
            _secGroupsModule = new SecGroups(
                scope,
                'sec_groups',
                config.secGroups
            );

        }
        const __defaultSecGroup = new DataSbercloudNetworkingSecgroup(scope, 'default-sec-group', {
            name: 'default'
        });

        let _pgModule: Postgres | null = null;
        if(
            config.pgClusters
            &&
            _vpcsModule
        ){
            _pgModule = new Postgres(
                scope,
                'pg',
                config.pgClusters,
                _vpcsModule.vpcs,
                _vpcsModule.subnets,
                _secGroupsModule ? _secGroupsModule.secGroups : {},
                _staticIpsModule ? _staticIpsModule.elasticIps : {},
                __defaultSecGroup,
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