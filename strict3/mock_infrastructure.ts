import {Adapter, Enactment, send} from "./adapter";
import {AssertedBinding, MessagePayload, MessagePreBindingAssertions, ParamBindings} from "./binding_assertion";
import {AgentEndpoint, IncomingMessageListener, MessageInfrastructure} from "./message_infrastructure";
import {AgentIrl, decomposeIrl, MessageSchema, MessageSchemaIO, Role, RoleBindings} from "./protocol";
import {Request, Response} from "express";
import {containsProperties, filterProperties, minus} from "../utils";

const express = require('express');
const http = require('http');
const axios = require('axios');


async function httpsPost({body, host, port, ...options}) {
    const res = await axios.post(`http://${host}:${port}`, body);
    return res;
}

export class InMemoryAdapter implements Adapter {
    messageInfrastructure: MessageInfrastructure;
    roleBindings: RoleBindings;

    constructor(messageInfrastructure: MessageInfrastructure, roleBindings: RoleBindings) {
        this.messageInfrastructure = messageInfrastructure;
        this.roleBindings = roleBindings;
    }

    newEnactment(): Enactment<{}> {
        return new InMemoryEnactment<{}>(this, {});
    }
}

export class InMemoryEnactment<PB extends ParamBindings> implements Enactment<PB>, IncomingMessageListener {
    adapter: Adapter;
    bindings: PB;
    private readonly bindingListeners: { requiredParamNames: string[], callback: (newBindings: ParamBindings) => void }[];

    constructor(adapter: Adapter, bindings: PB) {
        this.adapter = adapter;
        this.bindings = bindings;
        this.bindingListeners = [];
        this.adapter.messageInfrastructure.addMessageReceivedListener(this);
    }

    async getBinding<PA extends ParamBindings>(satisfiableEvent: PA): Promise<PA> {
        return new Promise(resolve => {
            this.bindingListeners.push({
                requiredParamNames: Object.keys(satisfiableEvent),
                callback: <(p: PA) => void>resolve
            });
        });
    }

    onNewBindings(newBindings: ParamBindings) {
        Object.assign(this.bindings, newBindings);
        for (let {requiredParamNames, callback} of this.bindingListeners)
            if (containsProperties(this.bindings, requiredParamNames))
                return callback(filterProperties(this.bindings, requiredParamNames));
    }

    onIncomingMessage(message: ParamBindings): void {
        const newBindings = minus(message, this.bindings);
        if (Object.keys(newBindings).length > 0)
            this.onNewBindings(newBindings);
    }
}

export class MockMessageInfrastructure implements MessageInfrastructure {
    private registeredAgents: { [roleName: Role['name']]: AgentEndpoint } = {};
    private server;
    private incomingMessageListeners: IncomingMessageListener[] = [];

    static async newAndReady(port: number): Promise<MockMessageInfrastructure> {
        return new Promise(resolve => new MockMessageInfrastructure(port, infra => {
            console.log(`Example app listening on port ${port}!`);
            resolve(infra);
        }));
    }

    constructor(port: number, onReady?: (infra: MockMessageInfrastructure) => void) {
        this.incomingRequestListener = this.incomingRequestListener.bind(this);

        const app = express();

        // express configuration
        app.use(express.json({type: '*/*'}));

        // Set your routes
        app.post('/', this.incomingRequestListener);

        this.server = app.listen(port, () => onReady && onReady(this));
    }

    close() {
        this.server.close();
    }

    incomingRequestListener(req: Request, res: Response): void {
        console.log(`Received message: ${JSON.stringify(req.body)}`);
        res.send(true);
        for (let listener of this.incomingMessageListeners)
            listener.onIncomingMessage(req.body);
    }

    async registerAgentEndpoint(role: Role, agentIrl: AgentIrl): Promise<boolean> {
        if (role.name in this.registeredAgents)
            return false;
        this.registeredAgents[role.name] = agentIrl;
        return true;
    }

    async send<M extends MessageSchema>(toIRLs: AgentIrl[], payload: MessagePayload<M>): Promise<MessagePayload<M>> {
        for (let irl of toIRLs) {
            const {host, port} = decomposeIrl(irl);
            console.log(`Sending message to '${irl}': ${JSON.stringify(payload)}`);
            await httpsPost({
                host,
                port,
                method: 'POST',
                body: payload
            });
        }
        return payload;
    }

    addMessageReceivedListener(callback: IncomingMessageListener) {
        this.incomingMessageListeners.push(callback);
    }
}
