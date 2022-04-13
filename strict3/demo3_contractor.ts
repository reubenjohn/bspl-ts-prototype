import {boolean, Enactment, newEnactment, number, send, string, when} from "./adapter";
import {InMemoryAdapter} from "./mock_infrastructure";
import {staticRoleBinding} from "./demo3_common";
import {BidMessageSchema, ContractingProtocol, ContractingProtocolType} from "./demo_protocol";
import {MessageInfrastructure} from "./message_infrastructure";

export async function main_contractor(mockMessageInfrastructure: MessageInfrastructure) {
    let adapter = new InMemoryAdapter<ContractingProtocolType>(ContractingProtocol, mockMessageInfrastructure, staticRoleBinding, "Contractor");

    const enactment1State0 = adapter.newEnactment();

    let enactment1State1: Enactment<ContractingProtocolType, {
        contractID: number,
        spec: string
    }> = await when(enactment1State0, {contractID: number(), spec: string()});

    const enactment2State1 = newEnactment(adapter, enactment1State1.bindings);

    //FIXME spec not raising compile time error
    let enactment1State2:
        Enactment<ContractingProtocolType, { contractID: number, bidID: number, spec: string, amount: number }>
        = await send<typeof enactment1State1['bindings'], ContractingProtocolType, BidMessageSchema>(enactment1State1, BidMessageSchema,
        {bidID: 1, amount: 100});
    // let enactment1State2_1:
    //     Enactment<ContractingProtocolType, { contractID: number, bidID: number, spec: string, amount: number }>
    //     = await send<typeof enactment1State2['bindings'], ContractingProtocolType, BidMessageSchema>(enactment1State2, BidMessageSchema,
    //     {bidID: 1, amount: 100});

    let enactment1State3 = await when(enactment1State2, {accepted: boolean(), closed: boolean()});

    let enactment2State2: typeof enactment2State1 & Enactment<ContractingProtocolType, { amount: number }> = await send(enactment2State1, BidMessageSchema,
        {bidID: 2, amount: 100});
    let enactment2State3 = await when(enactment2State2, {accepted: boolean(), closed: boolean()});

}

