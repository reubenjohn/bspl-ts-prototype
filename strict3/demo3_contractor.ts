import {Enactment, number, send, string, when} from "./adapter";
import {InMemoryAdapter} from "./mock_infrastructure";
import {staticRoleBinding} from "./demo3_common";
import {BidMessageSchema} from "./demo_protocol";
import {MessageInfrastructure} from "./message_infrastructure";

export async function main_contractor(mockMessageInfrastructure: MessageInfrastructure) {
    let adapter = new InMemoryAdapter(mockMessageInfrastructure, staticRoleBinding);

    const enactment1State0 = adapter.newEnactment();

    let enactment1State1: Enactment<{
        contractID: number,
        spec: string
    }> = await when(enactment1State0, {contractID: number(), spec: string()});

    let enactment1State3: typeof enactment1State1 & Enactment<{ amount: number }> = await send(enactment1State1, BidMessageSchema,
        {bidID: 1, amount: 100});

    // const enactment2State0 = adapter.newEnactment();
    //
    // let enactment2State1: Enactment<{
    //     contractID: number,
    //     spec: string
    // }> = await when(enactment2State0, {contractID: number(), spec: string()});
    //
    // let enactment2State3: typeof enactment2State1 & Enactment<{ amount: number }> = await send(enactment2State1, BidMessageSchema,
    //     {bidID: 1, amount: 100});
}
