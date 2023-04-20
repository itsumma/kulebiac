// Static ip module
export interface StaticIp{
    name: string;
    zone: string;
}

export interface StaticIpsOutput{
    ip: string
}
export interface StaticIpsOutputMap{
    [key: string] : StaticIpsOutput
}
