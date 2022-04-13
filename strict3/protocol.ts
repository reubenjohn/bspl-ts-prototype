import {ParamBindings} from "./binding_assertion";

export type AgentIrl = string;

export function decomposeIrl(irl: AgentIrl): { host: string, port: number } {
    return {host: irl.split(':')[0], port: parseInt(irl.split(':')[1])}
}

export interface Role {
    name: string;
}

export interface RoleBindings {
    [roleName: Role['name']]: AgentIrl;
}

export interface MessageSchemaIO<IN extends ParamBindings, OUT extends ParamBindings> {
    name: string;
    inParams: IN;
    outParams: OUT;
    fromRole: Role;
    toRoles: Role[];
}

export interface MessageSchema extends MessageSchemaIO<ParamBindings, ParamBindings> {
}

export type MessageBindings<M extends MessageSchema> = M['inParams'] & M['outParams'];

export  interface Protocol {
    name: string;
    roles: Role[];
    messages: MessageSchema[];  // TODO: Use key value pair based on unique message identifier
    keyParamNames: ParamBindings;   // TODO: Use an array instead of a map to avoid redundancy?
}