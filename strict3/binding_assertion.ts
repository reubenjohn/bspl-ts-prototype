import {MessageSchema} from "./protocol";

const BOUND = '_BOUND';
export type Bound<T> = T | typeof BOUND;

type ParamValue = string | number | {};

export interface ParamBindings {
    [paramName: string]: ParamValue;
}

interface BindingAssertions {
    bound: ParamBindings;
    unbound: ParamBindings;
}

interface BindingAssertionsT<B, U> {
    bound: B;
    unbound: U;
}

export type SatisfiableEvent = ParamBindings;

export type MessagePayload<M extends MessageSchema> = M['inParams'] & M['outParams'];
type P1 = MessagePayload<{ name: 'asd', inParams: {a: number}, outParams: {}, fromRole: {name: ''}, toRoles: []}>;

export type MessagePreBindingAssertions<M extends MessageSchema> =
    BindingAssertionsT<M['inParams'], M['outParams']>;//TODO Handle nils
export type MessagePostBindingAssertions<M extends MessageSchema> =
    BindingAssertions
    & { bound: M['inParams'] & M['outParams'] };
export type AssertedBinding<B extends BA['bound'], BA extends BindingAssertions> = Exclude<B, BA['unbound']>;
export type AssertedBinding2<BA extends BindingAssertions> = Exclude<BA['bound'], BA['unbound']>;
