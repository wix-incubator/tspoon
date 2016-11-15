import * as hosts from './hosts';
import * as hostsBase from './hosts-base';

export * from './chainable-hosts';
export const MultipleFilesHost = hosts.MultipleFilesHost;
export const SingleFileHost = hosts.SingleFileHost;
export const HostBase = hostsBase.HostBase;
export const ChainableHost = hostsBase.ChainableHost;
export const chainHosts = hostsBase.chainHosts;
