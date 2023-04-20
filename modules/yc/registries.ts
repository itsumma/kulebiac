import {Construct} from "constructs";
import {ContainerRegistry} from "../../.gen/providers/yandex/container-registry";
import {StoreRegistries} from "../../core/interfaces/yc/store";
import {Registry} from "../../core/interfaces/yc/registries";

export class Registries extends Construct{
    public registries : StoreRegistries = {};

    constructor(
        scope: Construct,
        name: string,
        registries: Registry[]
    ) {
        super(scope, name);

        registries.forEach((item: Registry) => {
           const _rId = item.name;

           this.registries[_rId] = new ContainerRegistry(scope, _rId, {
               name: item.name
           })
        });
    }
}