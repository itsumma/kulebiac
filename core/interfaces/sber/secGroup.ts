export interface SecGroupRule{
    direction: string;
    remoteCidr: string;

    ethertype?: string;
    protocol?: string;
    portRangeMin?: number;
    portRangeMax?: number;
    ports?: string;
}

export interface SecGroup{
    name: string;
    rules: SecGroupRule[];
}