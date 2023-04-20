import {Construct} from "constructs";
import {RandomProvider} from "../.gen/providers/random/provider";

export function createRandomProvider(scope: Construct){
    return new RandomProvider(scope, 'random');
}