import * as moment from 'moment';

export const MANAGED_BY="Kulebiac FREE"
export const KULEBIAC_VERSION="1.0.0"
export const DATE_TIME_FORMAT='YYYY-MM-DD HH:mm:ss'

export interface LabelsInterface{
    [key: string] : string
}

export function getDefaultLabels(env: string = "production") : LabelsInterface{
    return {
        managedBy: MANAGED_BY,
        kulebiacVersion: KULEBIAC_VERSION,
        environment: env,
        createdAt: moment(new Date()).format(DATE_TIME_FORMAT)
    }
}
