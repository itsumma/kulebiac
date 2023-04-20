import exp = require("constants");
import {YandexStackConfig} from "./interfaces/yc/stackConfig";

export interface BaseStackConfig{
    name: string;
    provider: string;
}

export interface StackConfig extends YandexStackConfig, BaseStackConfig {}