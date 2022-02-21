import {ParamBindings} from "./binding_assertion";

export type AgentIrl = string;

export interface Role {
    name: string;
}

export interface RoleBindings {
    [roleName: Role['name']]: AgentIrl;
}

export interface MessageSchema {
    inParams: ParamBindings;
    outParams: ParamBindings;
    fromRole: Role;
    toRoles: Role[];
}
