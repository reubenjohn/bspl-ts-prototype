import {AssertedBinding} from "./binding_assertion";
import {Adapter, number, send, when} from "./adapter";
import {DefaultAdapter} from "./mock_infrastructure";
import {staticRoleBinding} from "./demo3_common";
import {AcceptMessageSchema, OfferMessageSchema} from "./demo_protocol";
import {MessageInfrastructure} from "./message_infrastructure";

type STest1 = AssertedBinding<{ p1: '' }, { bound: { p1: '' }, unbound: {} }>;
type STest2 = AssertedBinding<{ p1: '', p2: '' }, { bound: { p1: '' }, unbound: { p3: '' } }>;
type STest3 = AssertedBinding<{ p1: '', p3: '' }, { bound: { p1: '' }, unbound: { p3: '' } }>;

export async function main_government(messageInfrastructure1: MessageInfrastructure) {

    // TODO Give first class meaning to keys
    // TODO Fluent API
    // TODO A single primitive sendWhen
    // Tango for computing concise state machines
    let enactmentState0 = new DefaultAdapter<{}>(
        messageInfrastructure1, staticRoleBinding,
        {});

    // Can we do something like enactment0.sendOfferMessage where the IDE
    let enactmentState1 = await send<typeof enactmentState0, OfferMessageSchema, { contractID: 1, bidID: 1, spec: 'build bridge' }>(enactmentState0, OfferMessageSchema, {
        contractID: 1,
        bidID: 1,
        spec: 'build bridge'
    });
    // let failure1 = send(enactmentState0, OfferMessageSchema, {contractID: 1, spec: 'build bridge'});  // should fail to compile


    let enactmentState2: Adapter<{
        contractID: 1,
        bidID: 1,
        spec: 'build bridge',
        amount: number
    }> = await when(enactmentState1, {amount: number()});

    // TODO Remove the message schema parameter and just assert if the message payload is one of the possible messages

    //TODO let enactmentState3 = sendWhen(enactmentState2, enabled(AcceptMessageSchema), () => ({accepted: true, closed: true}));
    // let enactmentState3 = when(enactmentState2, enabled(AcceptMessageSchema), () => ({accepted: true, closed: true}));
    let enactmentState3 = await send(enactmentState2, AcceptMessageSchema, {accepted: true, closed: true});
    // let enactmentState4 = send(enactmentState2, RejectMessageSchema, {accepted: true, closed: true});
    // let enactmentState3 = send(enactmentState1, Accept2MessageSchema, {accepted: true, closed: true});
    // let enactmentState3_ = send(enactmentState3, AcceptMessageSchema, {accepted: true, closed: true});


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
