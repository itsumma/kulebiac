import {PROVIDER_SBERCLOUD, PROVIDER_YANDEX} from "./constants";
import {YandexProvider} from "../.gen/providers/yandex/provider";
import {Construct} from "constructs";
import {StackConfig} from "./stackConfig";
import {SbercloudProvider} from "../.gen/providers/sbercloud/provider";

export function createProvider(scope: Construct, config: StackConfig){
    switch (config.provider){
        case PROVIDER_YANDEX:
            return new YandexProvider(scope, PROVIDER_YANDEX, {
                cloudId: config.cloudId,
                folderId: config.folderId,
                token: config.token
            });

        case PROVIDER_SBERCLOUD:
            return new SbercloudProvider(scope, PROVIDER_SBERCLOUD, {
                accessKey: config.accessKey,
                secretKey: config.secretKey,
                region: "ru-moscow-1"
            });

        default:
            return null;
    }
}