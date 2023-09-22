import {Construct} from "constructs";
import {StoreKeyPairs} from "../../core/interfaces/sber/store";
import {KeyPair} from "../../core/interfaces/sber/keyPair";
import {ComputeKeypair} from "../../.gen/providers/sbercloud/compute-keypair";

export class KeyPairs extends Construct{
    public keyPairs: StoreKeyPairs = {};

    constructor(
        scope: Construct,
        name: string,
        keyPairs: KeyPair[]
    ) {
        super(scope, name);

        keyPairs.forEach((item: KeyPair) => {
            const _kId = item.name;

            this.keyPairs[_kId] = new ComputeKeypair(scope, _kId, {
                name: item.name,
                publicKey: item.publicKey,
                keyFile: item.keyFile
            })
        })
    }
}