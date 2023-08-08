import {Construct} from "constructs";
import {StoreKmsKeys, StoreServiceAccounts} from "../../core/interfaces/yc/store";
import {Kms} from "../../core/interfaces/yc/kms";
import {KmsSymmetricKey} from "../../.gen/providers/yandex/kms-symmetric-key";
import {KmsSymmetricKeyIamBinding} from "../../.gen/providers/yandex/kms-symmetric-key-iam-binding";
import {LabelsInterface} from "../../core/labels";

export class KmsKeys extends Construct{
    public kmsKeys: StoreKmsKeys = {};

    private readonly sa: StoreServiceAccounts = {};


    constructor(
        scope: Construct,
        name: string,
        kmsKeys: Kms[] = [],
        sa: StoreServiceAccounts = {},
        defaultLabels : LabelsInterface = {}
    ) {
        super(scope, name);

        this.sa = sa;

        const __defaults = {
            defaultAlgorithm: 'AES_256',
            rotationPeriod: '24h',
            role: "kms.keys.encrypterDecrypter"
        }

        kmsKeys.forEach((item: Kms) => {
            const _id = item.name;

            const _kmsLabels = item.labels ? item.labels : {};

            const _kmsKey= new KmsSymmetricKey(scope, _id, {
                name: item.name,
                description: item.description,
                defaultAlgorithm: item.algorithm ? item.algorithm : __defaults.defaultAlgorithm,
                rotationPeriod: item.rotationPeriod ? item.rotationPeriod : __defaults.rotationPeriod,
                labels: {...defaultLabels, ..._kmsLabels}
            });

            this.kmsKeys[_id] = _kmsKey;

            new KmsSymmetricKeyIamBinding(scope, `${_id}__binging`, {
                symmetricKeyId: _kmsKey.id,
                role: __defaults.role,
                members: item.sa.map((saItem: string) => `serviceAccount:${this.sa[saItem].id}`)
            })
        })
    }


}