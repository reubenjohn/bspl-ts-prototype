import {Adapter} from "./adapter";
import {MessagePayload, ParamBindings} from "./binding_assertion";
import {AgentEndpoint, MessageInfrastructure} from "./message_infrastructure";
import {AgentIrl, decomposeIrl, MessageSchema, Role, RoleBindings} from "./protocol";
import {Request, Response} from "express";

const express = require('express');
const http = require('http');
const axios = require('axios');


async function httpsPost({body, host, port, ...options}) {
    const res = await axios.post(`http://${host}:${port}`, body);
    return res;
}

export class DefaultAdapter<B extends ParamBindings> implements Adapter<B> {
    bindings: B;
    messageInfrastructure: MessageInfrastructure;
    roleBindings: RoleBindings;

    constructor(messageInfrastructure: MessageInfrastructure, roleBindings: RoleBindings, bindings: B) {
        this.bindings = bindings;
        this.messageInfrastructure = messageInfrastructure;
        this.roleBindings = roleBindings;
    }
}

export class MockMessageInfrastructure implements MessageInfrastructure {
    private registeredAgents: { [roleName: Role['name']]: AgentEndpoint } = {};
    private server;

    constructor(port: number) {
        this.incomingRequestListener = this.incomingRequestListener.bind(this);

        const app = express();

        // express configuration
        app.use(express.json({type: '*/*'}));

        // Set your routes
        app.post('/', this.incomingRequestListener);

        this.server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));
    }

    close() {
        this.server.close();
    }

    incomingRequestListener(req: Request, res: Response): void {
        console.log(`Received message: ${JSON.stringify(req.body)}`);
        res.send(true);
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
}
