import {PROVIDER_YANDEX} from "./constants";
import {S3Backend} from "cdktf";
import {Construct} from "constructs";
import {StackConfig} from "./stackConfig";

export function createBackend(scope : Construct, config: StackConfig){
    switch (config.provider){
        case PROVIDER_YANDEX:
            return new S3Backend(scope, {
                endpoint: "storage.yandexcloud.net",
                bucket: config.backendConfiguration.bucket,
                key: "terraform.tfstate",
                region: "ru-central1",
                skipRegionValidation: true,
                skipCredentialsValidation: true,
                accessKey: config.backendConfiguration.accessKey,
                secretKey: config.backendConfiguration.secretKey
            });

        default:
            return null;
    }
}