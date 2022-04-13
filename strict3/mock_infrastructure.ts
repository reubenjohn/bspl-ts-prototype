import {Adapter, Enactment} from "./adapter";
import {MessagePayload, ParamBindings} from "./binding_assertion";
import {AgentEndpoint, IncomingMessageListener, MessageInfrastructure} from "./message_infrastructure";
import {AgentIrl, decomposeIrl, MessageSchema, Protocol, Role, RoleBindings} from "./protocol";
import {Request, Response} from "express";
import {containsProperties, filterProperties, minus} from "../utils";

const express = require('express');
const http = require('http');
const axios = require('axios');


async function httpsPost({body, host, port, ...options}) {
    const res = await axios.post(`http://${host}:${port}`, body);
    return res;
}

export interface EventQuery {
    isSatisfied: (event: any) => boolean;
}

export class ParamBindingSatisfiedEventQuery implements EventQuery {
    constructor(public readonly paramBindings: ParamBindings) {
    }

    isSatisfied(event: ParamBindings) {
        for (let key in this.paramBindings) {
            if (!event.hasOwnProperty(key))
                return false;
            if (this.paramBindings[key] !== null && this.paramBindings[key] !== event[key])
                return false;
        }
        return true;
    }
}

export function paramBindingsSatisfied(params: ParamBindings): EventQuery {
    return new ParamBindingSatisfiedEventQuery(params);
}

export interface EventListener {
    onlyTriggerOnce: boolean;
    eventQuery: EventQuery,
    callback: (newBindings: ParamBindings) => void
}

export class InMemoryAdapter<P extends Protocol> implements Adapter<P>, IncomingMessageListener {
    protocol: P;
    messageInfrastructure: MessageInfrastructure;
    roleBindings: RoleBindings;
    readonly bindingListeners = new Set<EventListener>();
    private eventQueue = new Set<ParamBindings>();


    constructor(protocol: P, messageInfrastructure: MessageInfrastructure, roleBindings: RoleBindings, public readonly roleName: Role['name']) {
        this.protocol = protocol;
        this.messageInfrastructure = messageInfrastructure;
        this.roleBindings = roleBindings;
        this.messageInfrastructure.addMessageReceivedListener(this);
    }

    newEnactment(): Enactment<P, {}> {
        return new InMemoryEnactment<P, {}>(this, {});
    }

    onIncomingMessage(message: ParamBindings): void {
        this.notifyListeners(message);
    }

    notifyListeners(message: ParamBindings) {
        this.log(`Found ${this.bindingListeners.size} pre-existing listeners: ${JSON.stringify(Array.from(this.bindingListeners))}`);
        for(let it = this.bindingListeners.values(), next = it.next(); !next.done; next = it.next()) {
            const listener = next.value;
            if(this.tryNotifyListener(listener, message))
                return;
        }
        this.eventQueue.add(message);
    }

    private tryNotifyListener(listener: EventListener, message: ParamBindings) {
        if (listener.eventQuery.isSatisfied(message)) {
            listener.callback(message);
            this.eventQueue.delete(message);
            if (listener.onlyTriggerOnce)
                this.bindingListeners.delete(listener);
            return true;
        }
        return false;
    }

    addEventListener(listener: EventListener): void {
        this.log(`Found ${this.eventQueue.size} events already in queue: ${JSON.stringify(this.eventQueue)}`);
        for(let it = this.eventQueue.values(), next = it.next(); !next.done; next = it.next()) {
            const message = next.value;
            if(this.tryNotifyListener(listener, message))
                return;
        }
        this.bindingListeners.add(listener);
    }

    log(message: string): void {
        console.log(`[${this.roleName}] ${message}`);
    }
}

export class InMemoryEnactment<P extends Protocol, PB extends ParamBindings> implements Enactment<P, PB> {
    adapter: Adapter<P>;
    bindings: PB;
    constructor(adapter: Adapter<P>, bindings: PB) {
        this.adapter = adapter;
        this.bindings = bindings;
    }

    // TODO Handle case where the event is already satisfied
    async onParamBindingsSatisfied<PA extends ParamBindings>(satisfiableEvent: PA): Promise<PA> {
        return new Promise(resolve => {
            const listener: EventListener = {
                onlyTriggerOnce: true,
                eventQuery: paramBindingsSatisfied(satisfiableEvent),
                callback: (p: PA) => {
                    this.adapter.log(`Listener with query '${JSON.stringify(satisfiableEvent)}' satisfied by event '${JSON.stringify(p)}'`);
                    resolve(p);
                }
            };
            this.adapter.addEventListener(listener);
        });
    }

    onNewBindings(newBindings: ParamBindings) {
        Object.assign(this.bindings, newBindings);
    }
}

export class MockMessageInfrastructure implements MessageInfrastructure {
    private registeredAgents: { [roleName: Role['name']]: AgentEndpoint } = {};
    private server;
    private incomingMessageListeners: IncomingMessageListener[] = [];

    static async newAndReady(roleName: Role['name'], port: number): Promise<MockMessageInfrastructure> {
        return new Promise(resolve => new MockMessageInfrastructure(roleName, port, infra => {
            console.log(`[${roleName}] Agent listening on port ${port}!`);
            resolve(infra);
        }));
    }

    constructor(private readonly roleName: Role['name'], private readonly port: number, onReady?: (infra: MockMessageInfrastructure) => void) {
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
        this.log(`Received message: ${JSON.stringify(req.body)}`);
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
            this.log(`Sending message ${JSON.stringify(payload)} to '${irl}'`);
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

    log(message: string): void {
        console.log(`[${this.roleName}] ${message}`);
    }
}
