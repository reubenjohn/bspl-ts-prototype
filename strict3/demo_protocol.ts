import {MessageSchema, Role} from "./protocol";
import {Bound} from "./binding_assertion";
import {number, string} from "./adapter";

export interface OfferMessageSchema extends MessageSchema {
    name: 'Offer',
    inParams: {},
    outParams: { contractID: number, bidID: number, spec: string }
}

const GovernmentRole: Role = {name: 'Government'};
const ContractorRole: Role = {name: 'Contractor'};
export const OfferMessageSchema: MessageSchema & OfferMessageSchema = {
    name: 'Offer', inParams: {}, outParams: {contractID: number(), bidID: number(), spec: 'build bridge'},
    fromRole: GovernmentRole,
    toRoles: [ContractorRole]
};

export interface BidMessageSchema extends MessageSchema {
    name: 'Bid';
    inParams: { contractID: number, bidID: number, spec: string },
    outParams: { amount: number }
    fromRole: typeof ContractorRole;
    toRoles: [typeof GovernmentRole];
}

export const BidMessageSchema: BidMessageSchema = {
    name: 'Bid',
    inParams: {contractID: number(), bidID: number(), spec: string()},
    outParams: {amount: number()},
    fromRole: ContractorRole,
    toRoles: [GovernmentRole],
};

export interface AcceptMessageSchema extends MessageSchema {
    name: 'Accept',
    inParams: { contractID: 1, bidID: 1, spec: 'build bridge', amount: number },
    outParams: { accepted: Bound<boolean>, closed: Bound<boolean> },
    fromRole: typeof GovernmentRole,
    toRoles: [typeof ContractorRole],
}

export const AcceptMessageSchema: AcceptMessageSchema = {
    name: 'Accept',
    inParams: {contractID: 1, bidID: 1, spec: 'build bridge', amount: 100},
    outParams: {accepted: true, closed: true},
    fromRole: GovernmentRole,
    toRoles: [ContractorRole],
};