import {Construct} from "constructs";
import {YandexStackConfig} from "../core/interfaces/yc/stackConfig";

export class YandexInfra extends Construct{
    constructor(scope: Construct, name: string, config: YandexStackConfig) {
        super(scope, name);
    }
}