import {AssertedBinding, MessagePreBindingAssertions, ParamBindings} from "./binding_assertion";

export interface MessageSchema {
    inParams: ParamBindings;
    outParams: ParamBindings;
}



export function send<CB extends ParamBindings, M extends MessageSchema, O extends MessageSchema['outParams']>(
    currBindings: AssertedBinding<CB, MessagePreBindingAssertions<M>>,
    messageSchema: M,
    message: O
): CB & O {
    throw new Error('Not Implemented');
}

// TODO Check for impossible assertions for example, waiting for an amount parameter to be bound by a boolean type even though the protocol event schema defines it as a number
export function when<CB extends ParamBindings, BA>(
    currBindings: CB,
    satisfiableEvent: Exclude<BA, CB>   //FIXME Prevent specifying parameters that are already bound
): Promise<CB & BA> {
    throw new Error('Not Implemented');
}

export function custom<T>(value?: T): T {
    return <T>value;
}