import {AssertedBinding, MessagePayload, MessagePreBindingAssertions, ParamBindings} from "./binding_assertion";
import {MessageInfrastructure} from "./message_infrastructure";
import {MessageSchema, RoleBindings} from "./protocol";

export interface Adapter<B extends ParamBindings> {
    bindings: B;
    roleBindings: RoleBindings;
    messageInfrastructure: MessageInfrastructure;
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

export async function send<A extends Adapter<ParamBindings>, M extends MessageSchema, O extends M['outParams']>(
    adapter: A & Adapter<AssertedBinding<A['bindings'], MessagePreBindingAssertions<M>>>,
    messageSchema: M,
    message: O
): Promise<A & Adapter<O>> {
    const bindings = Object.assign(adapter.bindings, message);
    await adapter.messageInfrastructure.send(messageSchema.toRoles.map(({name}) => adapter.roleBindings[name]), extractMessageBindings(bindings, messageSchema))
    return Object.assign(adapter, {bindings});
}

// TODO Check for impossible assertions for example, waiting for an amount parameter to be bound by a boolean type even though the protocol event schema defines it as a number
export function when<A extends Adapter<ParamBindings>, BA extends ParamBindings>(
    adapter: A,
    satisfiableEvent: BA   //FIXME Prevent specifying parameters that are already bound
): Promise<A & Adapter<BA>> {
    console.error('Not Implemented');
    // throw new Error();
    return <any>adapter;
}

export function custom<T>(value?: T): T {
    return <T>value;
}

export const number = <T extends number>(value?: T): T => custom<T>();
export const string = <T extends string>(value?: T): T => custom<T>();
export const object = <T extends object>(value?: T): T => custom<T>();