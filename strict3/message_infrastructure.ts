import {MessagePayload} from "./binding_assertion";
import {AgentIrl, MessageSchema, Role} from "./protocol";

export interface MessageInfrastructure {
    registerAgentEndpoint(role: Role, agentIrl: AgentIrl): Promise<boolean>;

    send<M extends MessageSchema>(toIRLs: AgentIrl[], payload: MessagePayload<M>): Promise<MessagePayload<M>>;
}

export interface AgentEndpoint {

}