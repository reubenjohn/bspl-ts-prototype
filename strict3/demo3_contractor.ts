import {boolean, newEnactment, number, send, string, when} from "./adapter";
import {InMemoryAdapter} from "./mock_infrastructure";
import {staticRoleBinding} from "./demo3_common";
import {BidMessageSchema, ContractingEnactment, ContractingProtocol, ContractingProtocolType} from "./demo_protocol";
import {MessageInfrastructure} from "./message_infrastructure";

export async function main_contractor(mockMessageInfrastructure: MessageInfrastructure) {
    let adapter = new InMemoryAdapter<ContractingProtocolType>(
        ContractingProtocol, mockMessageInfrastructure, staticRoleBinding, "Contractor");

    const enactment = adapter.newEnactment();
    await when(enactment, {contractID: number(), spec: string()})
        .then(enactment => proposeAndNegotiateBid(enactment, 1, 300));
}

async function proposeAndNegotiateBid(
    enactment: ContractingEnactment<BidMessageSchema['inParams']>,
    bidID: number, amount: number
) {
    return await send(newEnactment(enactment), BidMessageSchema, {bidID, amount})
        .then(async bidEnactment => {
            if ("accepted" in (await when(bidEnactment, {closed: boolean()})).bindings)
                return bidEnactment;
            else return await proposeAndNegotiateBid(enactment, bidID + 1, amount - 100);
        });
}
