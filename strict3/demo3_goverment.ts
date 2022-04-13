import {newEnactment, number, send, when} from "./adapter";
import {InMemoryAdapter} from "./mock_infrastructure";
import {staticRoleBinding} from "./demo3_common";
import {
    AcceptMessageSchema,
    BidMessageSchema,
    ContractingEnactment,
    ContractingProtocol,
    ContractingProtocolType,
    OfferMessageSchema,
    RejectMessageSchema
} from "./demo_protocol";
import {MessageInfrastructure} from "./message_infrastructure";
import {MessageBindings} from "./protocol";

async function negotiateOffer(
    enactment: ContractingEnactment<MessageBindings<OfferMessageSchema>>,
    budget: number) {
    let bidEnactment: ContractingEnactment<MessageBindings<BidMessageSchema>>;
    while ((bidEnactment = (await when(newEnactment(enactment), {
        bidID: number(),
        amount: number()
    }))).bindings.amount > budget)
        await send(bidEnactment, RejectMessageSchema, {rejected: true, closed: true});
    return await send(bidEnactment, AcceptMessageSchema, {accepted: true, closed: true});
}

export async function main_government(messageInfrastructure1: MessageInfrastructure) {
    let adapter = new InMemoryAdapter<ContractingProtocolType>(
        ContractingProtocol, messageInfrastructure1, staticRoleBinding, "Government");

    await adapter.newEnactment()
        .send(OfferMessageSchema, {contractID: 1, spec: 'build bridge'})
        .then(enactment => negotiateOffer(enactment, 200));
}
