export interface IamUser{
    name: string;

    roles?: string[];
    createAccessKey?: boolean;
}

export interface IamUserAccessKeyOutput{
    accessKey: string;
    secretKey: string;
}

export interface IamUserAccessKeysOutputMap{
    [key: string]: IamUserAccessKeyOutput;
}