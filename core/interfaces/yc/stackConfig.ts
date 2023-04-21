import {BaseStackConfig} from "../../stackConfig";
import {BackendConfiguration} from "./backend";
import {ServiceAccount} from "./serviceAccounts";
import {Bucket} from "./buckets";
import {Registry} from "./registries";
import {StaticIp} from "./staticIps";
import {Vpc} from "./vpcs";

export interface YandexStackConfig extends BaseStackConfig{
    cloudId: string;
    folderId: string;
    token: string;
    backendConfiguration: BackendConfiguration;

    serviceAccounts: ServiceAccount[];
    buckets: Bucket[];
    staticIps: StaticIp[];
    vpcs: Vpc[];
    registries: Registry[];
}