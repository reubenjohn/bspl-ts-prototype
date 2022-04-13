import {MessageSchema, Protocol, Role} from "./protocol";
import {Bound} from "./binding_assertion";
import {number, string} from "./adapter";

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

export type ContractingProtocolType = Protocol & {
    name: 'Contracting',
    messages: [OfferMessageSchema, BidMessageSchema, AcceptMessageSchema],
    roles: [GovernmentRoleType, ContractorRoleType],
    keyParamNames: {'contractID': number, 'bidID': number},
};

export const ContractingProtocol: ContractingProtocolType = {
    name: 'Contracting',
    messages: [OfferMessageSchema, BidMessageSchema, AcceptMessageSchema],
    roles: [GovernmentRole, ContractorRole],
    keyParamNames: {'contractID': number(), 'bidID': number()},
}
