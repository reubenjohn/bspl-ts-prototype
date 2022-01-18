export interface ParameterBindings {
    [parameterName: string]: {}
}

export interface MessageBindings<InParameterBindings extends ParameterBindings, OutParameterBindings extends ParameterBindings> {
    ins: InParameterBindings
    outs: OutParameterBindings
}

export type BoundMessage<M extends MessageBindings<ParameterBindings, ParameterBindings>> = M["ins"] & M["outs"];

export type MessageEnablementHook<M extends MessageBindings<ParameterBindings, ParameterBindings>>
    = (boundInputs: M["ins"]) => BoundMessage<M> | typeof DONT_SEND;
export const DONT_SEND = "DONT_SEND";