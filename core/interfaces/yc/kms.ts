import {LabelsInterface} from "../../labels";

export interface Kms{
    name: string;
    sa: string[];

    description?: string;
    algorithm?: string;
    rotationPeriod?: string;
    labels?: LabelsInterface;
}