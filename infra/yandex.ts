import {Construct} from "constructs";
import {YandexStackConfig} from "../core/interfaces/yc/stackConfig";
import {ServiceAccounts} from "../modules/yc/serviceAccounts";
import {Buckets} from "../modules/yc/buckets";
import {Registries} from "../modules/yc/registries";
import {StaticIps} from "../modules/yc/staticIps";
import {Vpcs} from "../modules/yc/vpcs";
import {Postgres} from "../modules/yc/postgres";

export class YandexInfra extends Construct{
    constructor(scope: Construct, name: string, config: YandexStackConfig) {
        super(scope, name);

        const _saModule = new ServiceAccounts(
            scope,
            "service_accounts",
            config.serviceAccounts,
            config.folderId
        );

        const _bucketsModule = new Buckets(
            scope,
            "buckets",
            config.buckets,
            config.backendConfiguration.accessKey,
            config.backendConfiguration.secretKey
        );

        const _staticIpsModule = new StaticIps(
            scope,
            'static_ips',
            config.staticIps
        );

        const _vpcsModule = new Vpcs(
            scope,
            'vpcs',
            config.vpcs,
            _staticIpsModule.staticIps
        );

        const _registriesModule = new Registries(
            scope,
            'registries',
            config.registries
        );

        const _pgModule = new Postgres(
            scope,
            'pg',
            config.pgClusters,
            _vpcsModule.vpcs,
            _vpcsModule.infraSubnets
        )
    }
}