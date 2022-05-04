import {MessagePayload, ParamBindings} from "./binding_assertion";
import {AgentIrl, MessageSchema, Role} from "./protocol";

export interface IncomingMessageListener {
    onIncomingMessage: (message: ParamBindings) => void;
}

export interface MessageInfrastructure {
    registerAgentEndpoint(role: Role, agentIrl: AgentIrl): Promise<boolean>;

    send<M extends MessageSchema>(toIRLs: AgentIrl[], payload: MessagePayload<M>): Promise<MessagePayload<M>>;

    addMessageReceivedListener(callback: IncomingMessageListener);
}

export interface AgentEndpoint {

}