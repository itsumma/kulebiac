import {Construct} from "constructs";
import {YandexStackConfig} from "../core/interfaces/yc/stackConfig";
import {ServiceAccounts} from "../modules/yc/serviceAccounts";

export class YandexInfra extends Construct{
    constructor(scope: Construct, name: string, config: YandexStackConfig) {
        super(scope, name);

        const _saModule = new ServiceAccounts(
            scope,
            "service_accounts",
            config.serviceAccounts,
            config.folderId
        );
    }
}