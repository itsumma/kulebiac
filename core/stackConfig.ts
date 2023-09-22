// Backend configuration
import {YandexStackConfig} from "./interfaces/yc/stackConfig";
import {SbercloudStackConfig} from "./interfaces/sber/stackConfig";

export interface BaseStackConfig{
    provider: string;
    name: string;
}

export interface StackConfig extends YandexStackConfig, SbercloudStackConfig, BaseStackConfig {}