import {LabelsInterface} from "../../labels";

export interface Kms{
    name: string;
    description: string;
    sa: string[];

    algorithm?: string;
    rotationPeriod?: string;
    labels?: LabelsInterface;
}