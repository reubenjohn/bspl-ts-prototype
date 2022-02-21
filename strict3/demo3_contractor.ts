import {AssertedBinding} from "./binding_assertion";
import {Adapter, custom, number, send, string, when} from "./adapter";
import {DefaultAdapter, MockMessageInfrastructure} from "./mock_infrastructure";
import {staticRoleBinding} from "./demo3_common";
import {AcceptMessageSchema, BidMessageSchema, OfferMessageSchema} from "./demo_protocol";
import {decomposeIrl} from "./protocol";

export async function main_contractor() {
    let enactmentState0 = new DefaultAdapter<{}>(
        new MockMessageInfrastructure(decomposeIrl(staticRoleBinding["Contractor"]).port), staticRoleBinding,
        {});

    let enactmentState1: Adapter<{
        contractID: number,
        bidID: number,
        spec: string
    }> = await when(enactmentState0, {contractID: number(), bidID: number(), spec: string()});

    let enactmentState3: typeof enactmentState1 & Adapter<{ amount: number }> = await send(enactmentState1, BidMessageSchema,
        {amount: 100});
}
