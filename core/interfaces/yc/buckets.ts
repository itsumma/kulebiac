export interface BucketVersioning{
    enabled: boolean;
}

export interface Bucket{
    name: string;
    acl: string;
    defaultStorageClass: string;
    versioning: BucketVersioning
}

export interface BucketsOutput{
    id: string;
    bucket: string;
    domain: string;
}
export interface BucketsOutputMap{
    [key: string]: BucketsOutput
}