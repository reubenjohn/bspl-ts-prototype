export type ParameterName = string;
export type RoleName = string;

export interface MessageSchemaJson {
    "name": string,
    "type": "message",
    "parameters": ParameterName[],
    "keys": ParameterName[],
    "inParams": ParameterName[],
    "outParams": ParameterName[],
    "nils": [],
    "roles": RoleName[],
    "to": RoleName,
    "from": RoleName
}

export interface BsplProtocolJson {
    "name": string,
    "type": "protocol",
    "parameters": ParameterName[],
    "keys": ParameterName[],
    "inParams": ParameterName[],
    "outParams": ParameterName[],
    "nils": ParameterName[],
    "roles": RoleName[],
    "messages": { [signature: string]: MessageSchemaJson }
}
