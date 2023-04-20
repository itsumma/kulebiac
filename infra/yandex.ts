import {Construct} from "constructs";
import {YandexStackConfig} from "../core/interfaces/yc/stackConfig";
import {ServiceAccounts} from "../modules/yc/serviceAccounts";
import {Buckets} from "../modules/yc/buckets";
import {Registries} from "../modules/yc/registries";

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

        const _registriesModule = new Registries(
            scope,
            'registries',
            config.registries
        );
    }
}