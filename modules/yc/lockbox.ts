import {Construct} from "constructs";
import {StoreKmsKeys, StoreLockBoxSecret, StoreServiceAccounts} from "../../core/interfaces/yc/store";
import {LockboxSecret as LockBoxSecretInterface, LockboxSecretsOutputMap} from "../../core/interfaces/yc/lockbox";
import {LabelsInterface} from "../../core/labels";
import {LockboxSecret} from "../../.gen/providers/yandex/lockbox-secret";
import {LockboxSecretVersion, LockboxSecretVersionEntries} from "../../.gen/providers/yandex/lockbox-secret-version";
import {LockboxSecretIamBinding} from "../../.gen/providers/yandex/lockbox-secret-iam-binding";
import {TerraformOutput} from "cdktf";

export class Lockbox extends Construct{
    public secrets: StoreLockBoxSecret = {};

    private readonly kms: StoreKmsKeys = {};
    private readonly sa: StoreServiceAccounts = {};

    constructor(
        scope: Construct,
        name: string,
        secrets: LockBoxSecretInterface[] = [],
        kms: StoreKmsKeys = {},
        sa: StoreServiceAccounts = {},
        defaultLabels: LabelsInterface = {}
    ) {
        super(scope, name);

        this.kms = kms;
        this.sa = sa;

        secrets.forEach((item: LockBoxSecretInterface) => {
            const _lId = item.name;
            const _lLabels = item.labels ? item.labels : {};

            const secret = new LockboxSecret(scope, _lId, {
                name: item.name,
                description: item.description,
                kmsKeyId: this.kms[item.kms].id,
                labels: {...defaultLabels, ..._lLabels}
            });
            this.secrets[_lId] = secret;

            const secretBinging = new LockboxSecretIamBinding(scope, `${_lId}--binding`, {
                secretId: secret.id,
                role: 'lockbox.payloadViewer',
                members: [`serviceAccount:${this.sa[item.sa].id}`]
            })

            const secretEntries : LockboxSecretVersionEntries[] = [];
            for(const key in item.data){
                secretEntries.push({
                    key: key,
                    textValue: item.data[key]
                })
            }

            const secretVersion = new LockboxSecretVersion(scope, `${_lId}--data`, {
                secretId: secret.id,
                entries: secretEntries
            })
        });

        const lockboxOutput: LockboxSecretsOutputMap = {};
        for(const key in this.secrets){
            const _secret = this.secrets[key];

            lockboxOutput[key] = {
                name: _secret.name,
                id: _secret.id,
                status: _secret.status
            }
        }
        new TerraformOutput(scope, 'lockbox_data', {
            value: lockboxOutput
        });
    }
}