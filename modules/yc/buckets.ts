import {Construct} from "constructs";
import {StorageBucket} from "../../.gen/providers/yandex/storage-bucket";
import {Bucket, BucketsOutputMap} from "../../core/interfaces/yc/buckets";
import {TerraformOutput} from "cdktf";
import {StoreBuckets} from "../../core/interfaces/yc/store";

export class Buckets extends Construct{
    public buckets: StoreBuckets = {};

    constructor(
        scope: Construct,
        name: string,
        buckets: Bucket[],
        accessKey: string,
        secretKey: string
    ) {
        super(scope, name);

        buckets.forEach((item: Bucket) => {
            const _bId = item.name;
            this.buckets[_bId] = new StorageBucket(
                scope,
                _bId, {
                    bucket: item.name,
                    acl: item.acl,
                    defaultStorageClass: item.defaultStorageClass,
                    versioning: {
                        enabled: item.versioning.enabled
                    },
                    accessKey: accessKey,
                    secretKey: secretKey
                }
            )
        });

        const bucketOutput : BucketsOutputMap = {};
        for(const key in this.buckets){
            const _val = this.buckets[key];
            bucketOutput[key] = {
                id: _val.id,
                bucket: _val.bucket,
                domain: _val.bucketDomainName
            }
        }
        new TerraformOutput(scope, 'buckets_data', {
            value: bucketOutput
        });
    }
}