import {AssertedBinding, MessagePayload, MessagePreBindingAssertions, ParamBindings} from "./binding_assertion";
import {MessageInfrastructure} from "./message_infrastructure";
import {MessageSchema, RoleBindings} from "./protocol";
import {minus} from "../utils";


export interface Adapter {
    roleBindings: RoleBindings;
    messageInfrastructure: MessageInfrastructure;

    newEnactment() : Enactment<{}>;
}

function extractMessageBindings<M extends MessageSchema>(bindings: ParamBindings & MessagePayload<M>, messageSchema: M): MessagePayload<M> {
    let payload: { [key in keyof MessagePayload<M>]: any };
    payload = <any>{}; // FIXME
    for (let key in {...messageSchema.inParams, ...messageSchema.outParams}) {
        // @ts-ignore FIXME
        payload[key] = bindings[key];
    }
    return payload;
}

export interface Enactment<PB extends ParamBindings> {
    bindings: PB;
    adapter: Adapter;

    onNewBindings<PB extends ParamBindings>(newBindings: PB);
    getBinding<PB extends ParamBindings>(satisfiableEvent: PB): Promise<PB>;
}

export async function send<
    E extends Enactment<AssertedBinding<MessagePreBindingAssertions<M>>>,
    M extends MessageSchema,
    O extends M['outParams']>(
    enactment: E,
    messageSchema: M,
    message: O
): Promise<E & Enactment<O>> {
    const adapter = enactment.adapter;
    const newBindings = minus(message, enactment.bindings);
    const bindings = Object.assign(enactment.bindings, newBindings);
    const toIRLs = messageSchema.toRoles.map(({name}) => adapter.roleBindings[name]);
    await adapter.messageInfrastructure.send(toIRLs, extractMessageBindings(bindings, messageSchema));
    if(Object.keys(newBindings).length > 0)
        enactment.onNewBindings(newBindings);
    return Object.assign(enactment, {bindings});
}

// TODO Check for impossible assertions for example, waiting for an amount parameter to be bound by a boolean type even though the protocol event schema defines it as a number
export async function when<E extends Enactment<ParamBindings>, BA extends ParamBindings>(
    enactment: E,
    satisfiableEvent: BA   //FIXME Prevent specifying parameters that are already bound
): Promise<E & Enactment<BA>> {
    await enactment.getBinding(satisfiableEvent)
    console.log(`Event satisfied: ${JSON.stringify(Object.keys(satisfiableEvent))}`);
    return <any>enactment;
}

export function custom<T>(value?: T): T {
    return <T>value;
}

export const number = <T extends number>(value?: T): T => custom<T>();
export const string = <T extends string>(value?: T): T => custom<T>();
export const object = <T extends object>(value?: T): T => custom<T>();