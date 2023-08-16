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

        const __defaults = {
            acl: "private",
            defaultStorageClass: "STANDARD",
            website: {
                index: 'index.html',
                error: 'error.html'
            },
            cors: {
                allowedHeaders: ['*'],
                allowedOrigins: ['*'],
                allowedMethods: ['GET']
            }
        }

        buckets.forEach((item: Bucket) => {
            const _bId = item.name;
            this.buckets[_bId] = new StorageBucket(
                scope,
                _bId, {
                    bucket: item.name,
                    acl: item.acl ? item.acl : __defaults.acl,
                    defaultStorageClass: item.defaultStorageClass ? item.defaultStorageClass : __defaults.defaultStorageClass,
                    versioning: item.versioning && item.versioning.enabled ? {
                        enabled: item.versioning.enabled
                    } : undefined,
                    accessKey: accessKey,
                    secretKey: secretKey,

                    website: item.website && item.website.enabled ? {
                        indexDocument: item.website.params && item.website.params.index ? item.website.params.index : __defaults.website.index,
                        errorDocument: item.website.params && item.website.params.error ? item.website.params.error : __defaults.website.error
                    } : undefined,

                    corsRule: item.cors && item.cors.enabled ? [{
                        allowedOrigins: item.cors.params && item.cors.params.allowedOrigins ? item.cors.params.allowedOrigins : __defaults.cors.allowedOrigins,
                        allowedHeaders: item.cors.params && item.cors.params.allowedHeaders ? item.cors.params.allowedHeaders : __defaults.cors.allowedHeaders,
                        allowedMethods: item.cors.params && item.cors.params.allowedMethods ? item.cors.params.allowedMethods : __defaults.cors.allowedMethods,
                        exposeHeaders: item.cors.params && item.cors.params.exposeHeaders ? item.cors.params.exposeHeaders : undefined,
                        maxAgeSeconds: item.cors.params && item.cors.params.maxAgeSeconds ? item.cors.params.maxAgeSeconds : undefined
                    }] : undefined
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