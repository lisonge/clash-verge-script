export interface ClashConfig {
  dns?: DnsX;
  port?: number;
  mode?: string;
  secret?: string;
  rules?: string[];
  proxies?: ProxyX[];
  'socks-port'?: number;
  'redir-port'?: number;
  'allow-lan'?: boolean;
  'log-level'?: string;
  'external-controller'?: string;
  'proxy-providers'?: ProxyProvider;
  'rule-providers'?: Record<string, RuleProvider>;
  'proxy-groups'?: ProxyGroup[];
}

interface ProxyX {
  name: string;
  type: string;
  server: string;
  port: number;
  uuid: string;
  alterId: number;
  udp: boolean;
  cipher: string;
  network: string;
  'ws-opts': WsOpts;
}

interface WsOpts {
  path: string;
  headers: HeadersX;
}

interface HeadersX {
  Host: string;
}

interface ProxyProvider {
  // TODO
}

interface DnsX {
  enable?: boolean;
  listen?: string;
  ipv6?: boolean;
  nameserver?: string[];
  fallback?: string[];
  'fallback-filter'?: FallbackFilter;
  'use-system-hosts'?: boolean;
  'cache-algorithm'?: string;
  'enhanced-mode'?: string;
  'fake-ip-range'?: string;
  'fake-ip-filter'?: string[];
  'default-nameserver'?: string[];
  'proxy-server-nameserver'?: string[];
  'nameserver-policy'?: Record<string, string[]>;
}
interface FallbackFilter {
  geoip: boolean;
  ipcidr: string[];
  'geoip-code': string;
}

interface RuleProvider {
  url: string;
  path: string;
  type: string;
  format: string;
  behavior: string;
  interval: number;
}

export interface ProxyGroup {
  name: string;
  type: 'select' | 'url-test' | 'fallback' | 'load-balance';
  proxies: string[];
  url?: string;
  icon?: string;
  interval?: number;
  timeout?: number;
  lazy?: boolean;
  hidden?: boolean;
  tolerance?: number;
  strategy?: 'consistent-hashing' | 'round-robin';
  filter?: string;
  'include-all'?: boolean;
  'max-failed-times'?: number;
  'expected-status'?: string;
}
