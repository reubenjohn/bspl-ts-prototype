import {MessageSchema, Protocol, Role} from "./protocol";
import {Bound, ParamBindings} from "./binding_assertion";
import {Enactment, number, string} from "./adapter";

export interface OfferMessageSchema extends MessageSchema {
    name: 'Offer',
    inParams: {},
    outParams: { contractID: number, spec: string }
}

type GovernmentRoleType = Role & {name: 'Government'};
type ContractorRoleType = Role & {name: 'Contractor'};
const GovernmentRole: GovernmentRoleType = {name: 'Government'};
const ContractorRole: ContractorRoleType = {name: 'Contractor'};

export const OfferMessageSchema: MessageSchema & OfferMessageSchema = {
    name: 'Offer', inParams: {}, outParams: {contractID: number(), spec: 'build bridge'},
    fromRole: GovernmentRole,
    toRoles: [ContractorRole]
};

export interface BidMessageSchema extends MessageSchema {
    name: 'Bid';
    inParams: { contractID: number, spec: string },
    outParams: { bidID: number, amount: number }
    fromRole: typeof ContractorRole;
    toRoles: [typeof GovernmentRole];
}

export const BidMessageSchema: BidMessageSchema = {
    name: 'Bid',
    inParams: {contractID: number(), spec: string()},
    outParams: {bidID: number(), amount: number()},
    fromRole: ContractorRole,
    toRoles: [GovernmentRole],
};

export interface AcceptMessageSchema extends MessageSchema {
    name: 'Accept',
    inParams: { contractID: number, bidID: number, spec: string, amount: number },
    outParams: { accepted: Bound<boolean>, closed: Bound<boolean> },
    fromRole: typeof GovernmentRole,
    toRoles: [typeof ContractorRole],
}

export const AcceptMessageSchema: AcceptMessageSchema = {
    name: 'Accept',
    inParams: {contractID: number(), bidID: number(), spec: string(), amount: 100},
    outParams: {accepted: true, closed: true},
    fromRole: GovernmentRole,
    toRoles: [ContractorRole],
};

export interface RejectMessageSchema extends MessageSchema {
    name: 'Reject',
    inParams: { contractID: number, bidID: number, spec: string, amount: number },
    outParams: { rejected: Bound<boolean>, closed: Bound<boolean> },
    fromRole: typeof GovernmentRole,
    toRoles: [typeof ContractorRole],
}

export const RejectMessageSchema: RejectMessageSchema = {
    name: 'Reject',
    inParams: {contractID: number(), bidID: number(), spec: string(), amount: 100},
    outParams: {rejected: true, closed: true},
    fromRole: GovernmentRole,
    toRoles: [ContractorRole],
};

export type ContractingProtocolType = Protocol & {
    name: 'Contracting',
    messages: [OfferMessageSchema, BidMessageSchema, AcceptMessageSchema, RejectMessageSchema],
    roles: [GovernmentRoleType, ContractorRoleType],
    keyParamNames: {'contractID': number, 'bidID': number},
};

export type ContractingEnactment<BS extends ParamBindings> = Enactment<ContractingProtocolType, BS>;

export const ContractingProtocol: ContractingProtocolType = {
    name: 'Contracting',
    messages: [OfferMessageSchema, BidMessageSchema, AcceptMessageSchema, RejectMessageSchema],
    roles: [GovernmentRole, ContractorRole],
    keyParamNames: {'contractID': number(), 'bidID': number()},
}
