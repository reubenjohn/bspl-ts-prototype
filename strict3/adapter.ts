import {MessagePayload, ParamBindings} from "./binding_assertion";
import {MessageInfrastructure} from "./message_infrastructure";
import {MessageSchema, Protocol, Role, RoleBindings} from "./protocol";
import {minus} from "../utils";
import {EventListener, InMemoryEnactment} from "./mock_infrastructure";


export interface Adapter<P extends Protocol> {
    // TODO Make readonly
    protocol: P;
    roleBindings: RoleBindings;
    messageInfrastructure: MessageInfrastructure;

    readonly roleName: Role['name'];

    newEnactment(): Enactment<P, {}>;

    addEventListener(listener: EventListener): void;

    notifyListeners(message: ParamBindings): void;

    log(message: string): void;
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

export interface Enactment<P extends Protocol, PB extends ParamBindings> {
    bindings: PB;
    adapter: Adapter<P>;

    onNewBindings<PB extends ParamBindings>(newBindings: PB);

    onParamBindingsSatisfied<PB extends ParamBindings>(satisfiableEvent: PB): Promise<PB>;
}

export async function send<AS extends M['inParams'],
    P extends Protocol,
    M extends MessageSchema>(
    enactment: AS extends M['outParams'] ? never : Enactment<P, AS>,
    messageSchema: M,
    newBindings: M['outParams']
): Promise<Enactment<P, AS & M['outParams']>> {
    newBindings = minus(newBindings, messageSchema.inParams);
    const {adapter, bindings}: { adapter: Adapter<P>, bindings: AS } = enactment;
    Object.assign(bindings, newBindings);
    const toIRLs = messageSchema.toRoles.map(({name}) => adapter.roleBindings[name]);
    await adapter.messageInfrastructure.send(toIRLs, extractMessageBindings(bindings, messageSchema));
    if (Object.keys(newBindings).length > 0) {
        enactment.onNewBindings(newBindings);
        enactment.adapter.notifyListeners(enactment.bindings);
    }
    return Object.assign(enactment, {bindings});
}

// TODO Handle receiving messages as the satisfiable event
// TODO Check for impossible assertions for example, waiting for an amount parameter to be bound by a boolean type even though the protocol event schema defines it as a number
export async function when<P extends Protocol, E extends Enactment<P,
    ParamBindings>, BA extends ParamBindings>(
    enactment: E,
    satisfiableEvent: BA   //FIXME Prevent specifying parameters that are already bound
): Promise<E & Enactment<P, BA>> {
    const event = {...enactment.bindings, ...satisfiableEvent};
    enactment.adapter.log(`Awaiting event: ${JSON.stringify(event)}`);
    const newBindings = await enactment.onParamBindingsSatisfied(event)
    if (Object.keys(newBindings).length > 0)
        enactment.onNewBindings(minus(newBindings, enactment.bindings));
    return <any>enactment;
}

export function custom<T>(value?: T): T {
    return <T>(value || null);
}

export const boolean = <T extends boolean>(value?: T): T => custom<T>();
export const number = <T extends number>(value?: T): T => custom<T>();
export const string = <T extends string>(value?: T): T => custom<T>();
export const object = <T extends object>(value?: T): T => custom<T>();

export function newEnactment<P extends Protocol,
    PB extends ParamBindings>(adapter: Adapter<P>, bindings: PB extends P['keyParamNames'] ? never : PB): Enactment<P, PB> {
    return new InMemoryEnactment<P, PB>(adapter, bindings);
}