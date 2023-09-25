export interface RegistryImage{
    name: string;

    isPublic?: boolean;
    category?: string;
}

export interface RegistryUser{
    name: string;

    role?: string;
}

export interface Registry{
    name: string;

    images?: RegistryImage[];
    users?: RegistryUser[];
}