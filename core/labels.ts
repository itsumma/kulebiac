export const MANAGED_BY="kulebiac_free"
export const KULEBIAC_VERSION="1_0_0"

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
