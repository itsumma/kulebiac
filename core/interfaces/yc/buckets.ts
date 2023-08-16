export interface BucketVersioning{
    enabled: boolean;
}

export interface BucketWebSiteParams{
    index?: string;
    error?: string;
}

export interface BucketWebSite{
    enabled: boolean;
    params?: BucketWebSiteParams;
}

export interface BucketCorsParams{
    allowedHeaders?: string[];
    allowedMethods?: string[];
    allowedOrigins?: string[];
    exposeHeaders?: string[];
    maxAgeSeconds?: number;
}

export interface BucketCors{
    enabled: boolean;
    params?: BucketCorsParams;
}

export interface Bucket{
    name: string;

    acl?: string;
    defaultStorageClass?: string;
    versioning?: BucketVersioning;
    website?: BucketWebSite;
    cors?: BucketCors;
}

export interface BucketsOutput{
    id: string;
    bucket: string;
    domain: string;
}
export interface BucketsOutputMap{
    [key: string]: BucketsOutput
}