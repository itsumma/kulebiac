export interface ServiceAccount{
    name: string;

    description?: string;
    createStaticAccessKey?: boolean;
    createAccountKey?: boolean;
    createIamApiKey?: boolean;
    folderRoles?: string[];
}

export interface ServiceAccountSaKeysOutput{
    access_key: string,
    secret_key: string
}
export interface ServiceAccountSaKeysOutputMap{
    [key: string] : ServiceAccountSaKeysOutput
}

export interface ServiceAccountAccKeysOutput{
    id: string;
    service_account_id: string;
    created_at: string;
    key_algorithm: string;
    public_key: string;
    private_key: string;
}
export interface ServiceAccountAccKeysOutputMap{
    [key: string] : ServiceAccountAccKeysOutput
}

export interface ServiceAccountApiKeysOutput{
    id: string;
    secret: string;
    service_account_id: string;
    created_at: string;
}
export interface ServiceAccountApiKeysOutputMap{
    [key: string] : ServiceAccountApiKeysOutput
}