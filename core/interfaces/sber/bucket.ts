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

export interface BucketWebSiteParams{
    index?: string;
    error?: string;
}

export interface BucketWebSite{
    enabled: boolean;
    params?: BucketWebSiteParams;
}

export interface Bucket{
    name: string;

    acl?: string;
    storageClass?: string;
    versioning?: boolean;
    cors?: BucketCors;
    website?: BucketWebSite;
}

export interface BucketOutput{
    id: string;
    bucket: string;
    domain: string
}

export interface BucketsOutputMap{
    [key: string]: BucketOutput
}