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

export interface MessageSchema {
    name: string;
    inParams: ParamBindings;
    outParams: ParamBindings;
    fromRole: Role;
    toRoles: Role[];
}
