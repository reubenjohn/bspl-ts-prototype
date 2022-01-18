import {BsplProtocolJson, MessageSchemaJson} from "../src/bsplJsonSchema";
import {MessageBindings, ParameterBindings} from "../src/agentProgrammingModel";

const ContractingBsplJson: BsplProtocolJson = {
    "name": "Contracting",
    "type": "protocol",
    "parameters": [
        "contractID",
        "bidID",
        "spec",
        "amount",
        "closed"
    ],
    "keys": [
        "contractID",
        "bidID"
    ],
    "ins": [],
    "outs": [
        "spec",
        "closed",
        "bidID",
        "contractID",
        "amount"
    ],
    "nils": [],
    "roles": [
        "Government",
        "Contractor"
    ],
    "messages": {
        "Offer": {
            "name": "Offer",
            "type": "message",
            "parameters": [
                "contractID",
                "bidID",
                "spec"
            ],
            "keys": [
                "contractID",
                "bidID"
            ],
            "ins": [],
            "outs": [
                "contractID",
                "spec",
                "bidID"
            ],
            "nils": [],
            "roles": [
                "Government",
                "Contractor"
            ],
            "to": "Contractor",
            "from": "Government"
        },
        "Bid": {
            "name": "Bid",
            "type": "message",
            "parameters": [
                "contractID",
                "bidID",
                "spec",
                "amount"
            ],
            "keys": [
                "contractID",
                "bidID"
            ],
            "ins": [
                "contractID",
                "spec",
                "bidID"
            ],
            "outs": [
                "amount"
            ],
            "nils": [],
            "roles": [
                "Contractor",
                "Government"
            ],
            "to": "Government",
            "from": "Contractor"
        },
        "Accept": {
            "name": "Accept",
            "type": "message",
            "parameters": [
                "contractID",
                "bidID",
                "amount",
                "accepted",
                "closed"
            ],
            "keys": [
                "contractID",
                "bidID"
            ],
            "ins": [
                "contractID",
                "amount",
                "bidID"
            ],
            "outs": [
                "closed",
                "accepted"
            ],
            "nils": [],
            "roles": [
                "Government",
                "Contractor"
            ],
            "to": "Contractor",
            "from": "Government"
        },
        "Reject": {
            "name": "Reject",
            "type": "message",
            "parameters": [
                "contractID",
                "bidID",
                "amount",
                "rejected",
                "closed"
            ],
            "keys": [
                "contractID",
                "bidID"
            ],
            "ins": [
                "contractID",
                "amount",
                "bidID"
            ],
            "outs": [
                "rejected",
                "closed"
            ],
            "nils": [],
            "roles": [
                "Government",
                "Contractor"
            ],
            "to": "Contractor",
            "from": "Government"
        }
    }
}

export interface MessageBindingsOfProtocol {
    [key: string]: MessageBindings<ParameterBindings, ParameterBindings>
}

export interface ContractingMessageBindings extends MessageBindingsOfProtocol {
    Bid: {
        ins: {
            contractId: {},
            spec: {},
            bidID: {},
        },
        outs: {
            amount: {}
        },
    }
}

export interface Bid extends MessageBindings<{
    contractId: string,
    spec: object,
    bidID: string,
}, {
    amount: number
}> {
}
