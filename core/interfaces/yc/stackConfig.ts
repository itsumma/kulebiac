import {BaseStackConfig} from "../../stackConfig";
import {BackendConfiguration} from "./backend";
import {ServiceAccount} from "./serviceAccounts";
import {Bucket} from "./buckets";

export interface YandexStackConfig extends BaseStackConfig{
    cloudId: string;
    folderId: string;
    token: string;
    backendConfiguration: BackendConfiguration;

    serviceAccounts: ServiceAccount[];
    buckets: Bucket[];
}