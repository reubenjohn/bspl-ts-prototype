import {AssertedBinding} from "./binding_assertion";
import {Enactment, newEnactment, number, send, when} from "./adapter";
import {InMemoryAdapter} from "./mock_infrastructure";
import {staticRoleBinding} from "./demo3_common";
import {AcceptMessageSchema, ContractingProtocol, ContractingProtocolType, OfferMessageSchema} from "./demo_protocol";
import {MessageInfrastructure} from "./message_infrastructure";
import {Equals} from "tsafe";

type STest1 = Equals<{ p1: '' }, AssertedBinding<{ bound: { p1: '' }, unbound: {} }>>;
type STest2 = Equals<{ p1: '', p2: '' }, AssertedBinding<{ bound: { p1: '' }, unbound: { p3: '' } }>>;
type STest3 = Equals<{ p1: '', p3: '' }, AssertedBinding<{ bound: { p1: '' }, unbound: { p3: '' } }>>;

// const sTest3: AssertedBinding<{ bound: { p1: '' }, unbound: { p3: '' } }> = { p1: '', p3: '' };

export async function main_government(messageInfrastructure1: MessageInfrastructure) {

    // TODO Give first class meaning to keys
    // TODO Fluent API
    // TODO A single primitive sendWhen
    // Tango for computing concise state machines
    let adapter = new InMemoryAdapter<ContractingProtocolType>(ContractingProtocol, messageInfrastructure1, staticRoleBinding, "Government");

    let enactment1State0 = adapter.newEnactment();

    // Can we do something like enactment0.sendOfferMessage where the IDE
    let enactment1State1 = await send<{}, ContractingProtocolType, OfferMessageSchema>(
        enactment1State0, OfferMessageSchema, {
            contractID: 1,
            spec: 'build bridge'
        });
    // let failure1 = send(enactment1State0, OfferMessageSchema, {contractID: 1, spec: 'build bridge'});  // should fail to compile

    let enactment2State1 = newEnactment(adapter, enactment1State1.bindings);

    let enactment1State2: Enactment<ContractingProtocolType, {
        contractID: number,
        bidID: number,
        spec: string,
        amount: number
    }> = await when(enactment1State1, {bidID: number(), amount: number()});

    // TODO Remove the message schema parameter and just assert if the message payload is one of the possible messages

    //TODO let enactment1State3 = sendWhen(enactment1State2, enabled(AcceptMessageSchema), () => ({accepted: true, closed: true}));
    // let enactment1State3 = when(enactment1State2, enabled(AcceptMessageSchema), () => ({accepted: true, closed: true}));
    let enactment1State3 = await send(enactment1State2, AcceptMessageSchema, {accepted: true, closed: true});
    // let enactment1State4 = send(enactment1State2, RejectMessageSchema, {accepted: true, closed: true});
    // let enactment1State3 = send(enactment1State1, Accept2MessageSchema, {accepted: true, closed: true});
    // let enactment1State3_ = send(enactment1State3, AcceptMessageSchema, {accepted: true, closed: true});

    // let enactment2State1 = await send<{}, ContractingProtocolType, OfferMessageSchema>(
    //     enactment2State0, OfferMessageSchema, {
    //         contractID: 2,
    //         spec: 'build bridge'
    //     });

    let enactment2State2: Enactment<ContractingProtocolType, {
        contractID: number,
        bidID: number,
        spec: string,
        amount: number
    }> = await when(enactment2State1, {bidID: number(), amount: number()});

    let enactment2State3 = await send(enactment2State2, AcceptMessageSchema, {accepted: true, closed: true});

    // enact(protocol, async (adapter: {} & ParamBindings) => {
    //
    //     send(adapter, {bound: {}, unbound: {}})
    //
    //     when(now(), () => {
    //         send(Contracting.MessageSchemas.Offer, eventInfo => ({
    //             contractId: guid(),
    //             bidId: guid(),
    //             spec: 'build a 100m bridge'
    //         }));
    //     });
    // });
}
