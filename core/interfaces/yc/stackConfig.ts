import {BaseStackConfig} from "../../stackConfig";
import {BackendConfiguration} from "./backend";

export interface YandexStackConfig extends BaseStackConfig{
    cloudId: string;
    folderId: string;
    token: string;
    backendConfiguration: BackendConfiguration;
}