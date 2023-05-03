import {Construct} from "constructs";
import {ContainerRegistry} from "../../.gen/providers/yandex/container-registry";
import {StoreRegistries} from "../../core/interfaces/yc/store";
import {Registry} from "../../core/interfaces/yc/registries";
import {LabelsInterface} from "../../core/labels";

export class Registries extends Construct{
    public registries : StoreRegistries = {};

    constructor(
        scope: Construct,
        name: string,
        registries: Registry[],
        defaultLabels: LabelsInterface = {}
    ) {
        super(scope, name);

        registries.forEach((item: Registry) => {
            const _rId = item.name;

            const _registryLabels = item.labels !== undefined ? item.labels : {};
            this.registries[_rId] = new ContainerRegistry(scope, _rId, {
                name: item.name,
                labels: {...defaultLabels, ..._registryLabels}
            })
        });
    }
}