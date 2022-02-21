import {Adapter} from "./adapter";
import {MessagePayload, ParamBindings} from "./binding_assertion";
import {AgentEndpoint, MessageInfrastructure} from "./message_infrastructure";
import {AgentIrl, decomposeIrl, MessageSchema, Role, RoleBindings} from "./protocol";
import {Server} from "http";
import {Request, Response} from "express";

const express = require('express');
const http = require('http');

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

    constructor(port: number) {
        this.incomingRequestListener = this.incomingRequestListener.bind(this);

        const app = express();

        // express configuration
        app.use(express.json({type: '*/*'}));

        // Set your routes
        app.post('/', this.incomingRequestListener);

        app.listen(port, () => console.log(`Example app listening on port ${port}!`));

    }

    incomingRequestListener(req: Request, res: Response): void {
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
            const req = http.request({
                host,
                port,
                method: 'POST'
            }, (res) => {
                res.resume();
                res.on('end', () => {
                    if (!res.complete)
                        console.error(
                            'The connection was terminated while the message was still being sent');
                });
            });

            req.write(JSON.stringify(payload));
            req.end();
        }
        return new Promise(res => res(payload));
    }
}
