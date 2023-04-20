import {PROVIDER_YANDEX} from "./constants";
import {YandexProvider} from "../.gen/providers/yandex/provider";
import {Construct} from "constructs";
import {StackConfig} from "./stackConfig";

export function createProvider(scope: Construct, config: StackConfig){
    switch (config.provider){
        case PROVIDER_YANDEX:
            return new YandexProvider(scope, PROVIDER_YANDEX, {
                cloudId: config.cloudId,
                folderId: config.folderId,
                token: config.token
            });

        default:
            return null;
    }
}