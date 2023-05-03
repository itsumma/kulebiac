export const MANAGED_BY="kulebiac_free"
export const KULEBIAC_VERSION="1.0.0"

export interface LabelsInterface{
    [key: string] : string
}

export function getDefaultLabels(env: string = "production") : LabelsInterface{
    return {
        managed_by: MANAGED_BY,
        kulebiac_version: KULEBIAC_VERSION,
        environment: env
    }
}
