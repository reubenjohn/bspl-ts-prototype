import {Bid, ContractingMessageBindings} from "./bspl/contracting";
import {MessageEnablementHook} from "./src/agentProgrammingModel";

interface MessageSchemas extends ContractingMessageBindings {
    Bid: {
        ins: {
            contractId: string,
            spec: object,
            bidID: string,
        },
        outs: {
            amount: number
        },
    }
}

const onBidEnabled: MessageEnablementHook<MessageSchemas["Bid"]> = inputBindings => {
    // if (inputBindings["spec"])
    return {...inputBindings, amount: 123};
    // else
    // return null;
    // return inputBindings;
    // return DONT_SEND;
    // return "OTHER_UNRECOGNIZED_CONSTANT"
};

console.log("Hello")