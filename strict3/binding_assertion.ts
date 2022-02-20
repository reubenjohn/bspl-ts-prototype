import {MessageSchema} from "./adapter";

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

export type SatisfiableEvent = ParamBindings;

export type MessagePreBindingAssertions<M extends MessageSchema> =
    BindingAssertions
    & { bound: M['inParams'], unbound: M['outParams'] };//TODO Handle nils
export type MessagePostBindingAssertions<M extends MessageSchema> =
    BindingAssertions
    & { bound: M['inParams'] & M['outParams'] };
export type AssertedBinding<B extends BA['bound'], BA extends BindingAssertions> = {} extends BA['unbound'] ? B : Exclude<B, BA['unbound']>;
