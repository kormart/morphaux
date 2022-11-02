import {factoryCustom} from "./factoryCustom"
import {factoryMachine} from "./factoryMachine"
import {factoryContainer} from "./factoryContainer"
import { env } from 'process';

// this function returns different pulumi programs depending on arguments, for example
// an Azure ACI container, or a Rancher Helm application
export const createPulumiProgram = (envName: string, provider: string, service: string) => {
    // const service = selected.infra.type;
    // const provider = selected.infra.provider;
    // call different orchlet factories according to service
    switch(service) {
        case 'machine':
            return factoryMachine(provider, envName);
        case 'container':
            return factoryContainer(provider, envName);
        case 'custom':
            return async () => {};
        default:
            return async () => {};
    }
}

export const createCustomProgram = (envName: string, provider: string, service: string) => {
    // const service = selected.infra.type;
    // const provider = selected.infra.provider;
    // call different orchlet factories according to service
    switch(service) {
        case 'custom':
            return factoryCustom(provider, envName);
        default:
            return async () => {};
        }
}
