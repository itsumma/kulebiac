import {Construct} from "constructs";
import {StoreKmsKeys, StoreLockBoxSecret, StoreServiceAccounts} from "../../core/interfaces/yc/store";
import {
    LockboxDbSecretTargetRef,
    LockboxSecret as LockBoxSecretInterface,
    LockboxSecretsOutputMap
} from "../../core/interfaces/yc/lockbox";
import {LabelsInterface} from "../../core/labels";
import {LockboxSecret} from "../../.gen/providers/yandex/lockbox-secret";
import {LockboxSecretVersion, LockboxSecretVersionEntries} from "../../.gen/providers/yandex/lockbox-secret-version";
import {LockboxSecretIamBinding} from "../../.gen/providers/yandex/lockbox-secret-iam-binding";
import {TerraformOutput} from "cdktf";
import {StorePasswords} from "../../core/store";

export class Lockbox extends Construct{
    public secrets: StoreLockBoxSecret = {};

    private readonly kms: StoreKmsKeys = {};
    private readonly sa: StoreServiceAccounts = {};

    private readonly clickHousePasswords: StorePasswords = {};
    private readonly redisPasswords: StorePasswords = {};
    private readonly mongoPasswords: StorePasswords = {};
    private readonly mysqlPasswords: StorePasswords = {};
    private readonly pgPasswords: StorePasswords = {};


    constructor(
        scope: Construct,
        name: string,
        secrets: LockBoxSecretInterface[] = [],
        kms: StoreKmsKeys = {},
        sa: StoreServiceAccounts = {},
        clickHousePasswords : StorePasswords = {},
        redisPasswords: StorePasswords = {},
        mongoPasswords: StorePasswords = {},
        mysqlPasswords: StorePasswords = {},
        pgPasswords: StorePasswords = {},
        defaultLabels: LabelsInterface = {}
    ) {
        super(scope, name);

        this.kms = kms;
        this.sa = sa;

        this.clickHousePasswords = clickHousePasswords;
        this.redisPasswords = redisPasswords;
        this.mongoPasswords = mongoPasswords;
        this.mysqlPasswords = mysqlPasswords;
        this.pgPasswords = pgPasswords;

        const TARGET_REF_CLICKHOUSE = 'clickhouse';
        const TARGET_REF_REDIS = 'redis';
        const TARGET_REF_MONGO = 'mongo';
        const TARGET_REF_MYSQL = 'mysql';
        const TARGET_REF_POSTGRES = 'postgres';

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

            new LockboxSecretIamBinding(scope, `${_lId}--binding`, {
                secretId: secret.id,
                role: 'lockbox.payloadViewer',
                members: [`serviceAccount:${this.sa[item.sa].id}`]
            })

            const secretEntries : LockboxSecretVersionEntries[] = [];
            for(const key in item.data){
                if(typeof item.data[key] === "string"){
                    secretEntries.push({
                        key: key,
                        textValue: item.data[key] as string
                    })
                }else{
                    const _data = item.data[key] as LockboxDbSecretTargetRef;
                    switch (_data.type){
                        case TARGET_REF_CLICKHOUSE:
                            secretEntries.push({
                                key: key,
                                textValue: this.clickHousePasswords[`${_data.clusterName}__${_data.userName}`].result
                            });
                            break;

                        case TARGET_REF_REDIS:
                            secretEntries.push({
                                key: key,
                                textValue: this.redisPasswords[`${_data.clusterName}--pass`].result
                            });
                            break;

                        case TARGET_REF_MONGO:
                            secretEntries.push({
                                key: key,
                                textValue: this.mongoPasswords[`${_data.clusterName}__${_data.userName}`].result
                            });
                            break;

                        case TARGET_REF_MYSQL:
                            secretEntries.push({
                                key: key,
                                textValue: this.mysqlPasswords[`${_data.clusterName}__${_data.userName}--pass`].result
                            });
                            break;

                        case TARGET_REF_POSTGRES:
                            secretEntries.push({
                                key: key,
                                textValue: this.pgPasswords[`${_data.clusterName}__${_data.userName}--pass`].result
                            });
                            break;
                    }
                }

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