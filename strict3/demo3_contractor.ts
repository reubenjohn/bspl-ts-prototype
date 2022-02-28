import {Adapter, number, send, string, when} from "./adapter";
import {DefaultAdapter} from "./mock_infrastructure";
import {staticRoleBinding} from "./demo3_common";
import {BidMessageSchema} from "./demo_protocol";
import {MessageInfrastructure} from "./message_infrastructure";

export async function main_contractor(mockMessageInfrastructure: MessageInfrastructure) {
    let enactmentState0 = new DefaultAdapter<{}>(
        mockMessageInfrastructure, staticRoleBinding,
        {});

    let enactmentState1: Adapter<{
        contractID: number,
        bidID: number,
        spec: string
    }> = await when(enactmentState0, {contractID: number(), bidID: number(), spec: string()});

    let enactmentState3: typeof enactmentState1 & Adapter<{ amount: number }> = await send(enactmentState1, BidMessageSchema,
        {amount: 100});
}
