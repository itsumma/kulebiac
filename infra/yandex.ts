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
            _staticIpsModule !== null
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
            _vpcsModule !== null
            &&
            _staticIpsModule !== null
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
            _vpcsModule !== null
            &&
            _staticIpsModule !== null
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
            _vpcsModule !== null
            &&
            _saModule !== null
            &&
            _staticIpsModule !== null
            &&
            _bucketsModule !== null
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
                _bucketsModule.buckets,
                defaultLabels
            );
        }

        let _pgModule : Postgres | null = null;
        if(
            config.pgClusters
            &&
            _vpcsModule !== null
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
            _vpcsModule !== null
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
            _vpcsModule !== null
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
            _vpcsModule !== null
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

    }
}