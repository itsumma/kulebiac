// Copyright (c) HashiCorp, Inc
// SPDX-License-Identifier: MPL-2.0
import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import {StackConfig} from "./core/stackConfig";
import {createBackend} from "./core/backend";
import {createProvider} from "./core/provider";
import {createRandomProvider} from "./core/random";
import {PROVIDER_SBERCLOUD, PROVIDER_YANDEX} from "./core/constants";
import {YandexInfra} from "./infra/yandex";
import {getDefaultLabels, LabelsInterface} from "./core/labels";
import {YandexStackConfig} from "./core/interfaces/yc/stackConfig";
import {SbercloudInfra} from "./infra/sbercloud";
import {SbercloudStackConfig} from "./core/interfaces/sber/stackConfig";

class MyStack extends TerraformStack {
    private backend: any;
    private provider: any;
    private randomProvider: any;

    constructor(scope: Construct, id: string, config: StackConfig) {
        super(scope, id);

        this.backend = createBackend(this, config);
        this.provider = createProvider(this, config);
        this.randomProvider = createRandomProvider(this);

        const defaultLabels : LabelsInterface = getDefaultLabels(config.name);

        switch (config.provider){
            case PROVIDER_YANDEX:
                new YandexInfra(this, 'infra', config as YandexStackConfig, defaultLabels);
                return;

            case PROVIDER_SBERCLOUD:
                new SbercloudInfra(this, 'infra', config as SbercloudStackConfig, defaultLabels);
                return;

            default:
                return;
        }
    }
}

let ejs = require('ejs');
require('dotenv').config();

ejs.renderFile('./config.yaml', {env: process.env}, {}, (err: any, str: string) => {
    let yaml = require('js-yaml');
    const config = yaml.load(str);

    const app = new App();

    config.stacks.forEach((stack: StackConfig) => {
        new MyStack(app, stack.name, stack);
    });

    app.synth();
});