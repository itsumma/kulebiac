import {Construct} from "constructs";
import {YandexStackConfig} from "../core/interfaces/yc/stackConfig";
import {ServiceAccounts} from "../modules/yc/serviceAccounts";
import {Buckets} from "../modules/yc/buckets";
import {Registries} from "../modules/yc/registries";
import {StaticIps} from "../modules/yc/staticIps";
import {Vpcs} from "../modules/yc/vpcs";
import {Postgres} from "../modules/yc/postgres";
import {K8s} from "../modules/yc/k8s";
import {LabelsInterface} from "../core/labels";
import {ElasticSearch} from "../modules/yc/elasticSearch";
import {Instances} from "../modules/yc/instances";
import {Instance} from "../core/interfaces/yc/instances";
import {Mysql} from "../modules/yc/mysql";
import {Mongo} from "../modules/yc/mongo";
import {ClickHouse} from "../modules/yc/clickHouse";
import {Redis} from "../modules/yc/redis";
import {KmsKeys} from "../modules/yc/kms";
import {Lockbox} from "../modules/yc/lockbox";
import {InstanceGroups} from "../modules/yc/instanceGroups";

export class YandexInfra extends Construct{
    constructor(scope: Construct, name: string, config: YandexStackConfig, defaultLabels: LabelsInterface = {}) {
        super(scope, name);

        let _saModule : ServiceAccounts | null = null;
        if(config.serviceAccounts){
            _saModule = new ServiceAccounts(
                scope,
                "service_accounts",
                config.serviceAccounts,
                config.folderId
            );
        }


        let _bucketsModule : Buckets | null = null;
        if(config.buckets){
            _bucketsModule = new Buckets(
                scope,
                "buckets",
                config.buckets,
                config.backendConfiguration.accessKey,
                config.backendConfiguration.secretKey
            );
        }


        let _staticIpsModule : StaticIps | null = null;
        if(config.staticIps){
            _staticIpsModule = new StaticIps(
                scope,
                'static_ips',
                config.staticIps,
                defaultLabels
            );
        }


        let _vpcsModule : Vpcs | null = null;
        if(
            config.vpcs
            &&
            _staticIpsModule
        ){
            _vpcsModule = new Vpcs(
                scope,
                'vpcs',
                config.vpcs,
                _staticIpsModule.staticIps,
                defaultLabels
            );
        }


        let _privateInstances : Instances | null = null;
        if(
            config.privateInstances
            &&
            _vpcsModule
            &&
            _staticIpsModule
        ){
            _privateInstances = new Instances(
                scope,
                'private_instances',
                config.privateInstances,
                _vpcsModule.infraSubnets,
                _staticIpsModule.staticIps,
                defaultLabels
            )

        }


        let _publicInstances : Instances | null = null;
        if(
            config.publicInstances
            &&
            _vpcsModule
            &&
            _staticIpsModule
        ){
            const __publicInstancesTransform : Instance[] = config.publicInstances.map((item: Instance) => {
                return {
                    ...item,
                    isPublic: true
                }
            });

            _publicInstances = new Instances(
                scope,
                'public_instances',
                __publicInstancesTransform,
                _vpcsModule.publicSubnets,
                _staticIpsModule.staticIps,
                defaultLabels
            )
        }

        let _instanceGroups : InstanceGroups | null = null;
        if(
            config.instanceGroups
            &&
            _vpcsModule
            &&
            _saModule
        ){
            _instanceGroups = new InstanceGroups(
                scope,
                'instance_groups',
                config.instanceGroups,
                _vpcsModule.vpcs,
                _vpcsModule.infraSubnets,
                _vpcsModule.publicSubnets,
                _saModule.serviceAccounts,
                _saModule.folderRoles,
                defaultLabels
            )
        }


        let _registriesModule : Registries | null = null;
        if(config.registries){
            _registriesModule = new Registries(
                scope,
                'registries',
                config.registries,
                defaultLabels
            );
        }

        let _k8sModule : K8s | null = null;
        if(
            config.k8sClusters
            &&
            _vpcsModule
            &&
            _saModule
            &&
            _staticIpsModule
        ){
            _k8sModule = new K8s(
                scope,
                'k8s',
                config.k8sClusters,
                _vpcsModule.vpcs,
                _vpcsModule.infraSubnets,
                _saModule.serviceAccounts,
                _saModule.folderRoles,
                _staticIpsModule.staticIps,
                _saModule.staticAccessKeys,
                _saModule.accountKeys,
                _bucketsModule ? _bucketsModule.buckets : {},
                defaultLabels
            );
        }

        let _pgModule : Postgres | null = null;
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
                _vpcsModule.infraSubnets,
                defaultLabels
            )
        }

        let _mysqlModule : Mysql | null = null;
        if(
            config.mysqlClusters
            &&
            _vpcsModule
        ){
            _mysqlModule = new Mysql(
                scope,
                'mysql',
                config.mysqlClusters,
                _vpcsModule.vpcs,
                _vpcsModule.infraSubnets,
                defaultLabels
            )
        }

        let _elasticSearchModule : ElasticSearch | null = null;
        if(
            config.elasticSearchClusters
            &&
            _vpcsModule
        ){
            _elasticSearchModule = new ElasticSearch(
                scope,
                'elasticSearch',
                config.elasticSearchClusters,
                _vpcsModule.vpcs,
                _vpcsModule.infraSubnets,
                defaultLabels
            )
        }



        let _mongoModule: Mongo | null = null;
        if(
            config.mongoClusters
            &&
            _vpcsModule
        ){
            _mongoModule = new Mongo(
                scope,
                'mongo',
                config.mongoClusters,
                _vpcsModule.vpcs,
                _vpcsModule.infraSubnets,
                defaultLabels
            )
        }

        let _clickHouseModule: ClickHouse | null = null;
        if(
            config.clickHouseClusters
            &&
            _vpcsModule
        ){
            _clickHouseModule = new ClickHouse(
                scope,
                'clickHouse',
                config.clickHouseClusters,
                _vpcsModule.vpcs,
                _vpcsModule.infraSubnets,
                defaultLabels
            )
        }

        let _redisModule : Redis | null = null;
        if(
            config.redisClusters
            &&
            _vpcsModule
        ){
            _redisModule = new Redis(
                scope,
                'redis',
                config.redisClusters,
                _vpcsModule.vpcs,
                _vpcsModule.infraSubnets,
                defaultLabels
            )
        }

        let _kmsModule: KmsKeys | null = null;
        if(
            config.kmsKeys
            &&
            _saModule
        ){
            _kmsModule = new KmsKeys(
                scope,
                'kms',
                config.kmsKeys,
                _saModule.serviceAccounts,
                defaultLabels
            )
        }

        let _lockboxModule: Lockbox | null = null;
        if(
            config.lockboxSecrets
            &&
            _kmsModule
            &&
            _saModule
        ){
            _lockboxModule = new Lockbox(
                scope,
                'lockbox',
                config.lockboxSecrets,
                _kmsModule.kmsKeys,
                _saModule.serviceAccounts,
                defaultLabels
            )
        }



    }
}