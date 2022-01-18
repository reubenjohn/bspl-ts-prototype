import {ContractingMessageBindings} from "./bspl/contracting";
import {DONT_SEND, MessageEnablementHook} from "./src/agentProgrammingModel";

interface MessageSchemas extends ContractingMessageBindings {
    Bid: {
        ins: {
            contractId: string,
            spec: { name: string, version: number, body: object },
            bidID: string,
        },
        outs: {
            amount: number
        },
    }
}

const onBidEnabled: MessageEnablementHook<MessageSchemas["Bid"]> = inputBindings => {
    if (inputBindings["spec"]["version"] > 1)
        return {...inputBindings, amount: 123};
    else
        return DONT_SEND;

    // return null;
    // return inputBindings;
    // return "OTHER_UNRECOGNIZED_CONSTANT"
};

const input: MessageSchemas["Bid"]["ins"] = {
    contractId: "C123",
    spec: {name: "Contract1", version: 1, body: {content: "asd", signature: "RJ"}},
    bidID: "B123",
};

console.log(`Input: ${JSON.stringify(input)}`);
const output1 = onBidEnabled(input);
console.log(`Output: ${JSON.stringify(output1)}`);

input["spec"]["version"] = 2;
console.log(`Input: ${JSON.stringify(input)}`);
const output2 = onBidEnabled(input);
console.log(`Output: ${JSON.stringify(output2)}`);
