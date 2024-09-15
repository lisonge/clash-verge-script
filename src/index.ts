import type { ClashConfig, ProxyGroup } from './types';

const removeNames = ['无法使用', '没有节点'];
const route = {
  proxy: '线路-代理',
  china: '线路-大陆',
  inner: '线路-内网',
  innerProxy: '线路-内网代理',
  others: '线路-其他',
} as const;

const innerDomain = __INNER_DOMAIN__.split('\n').filter(Boolean);
const innerRules = innerDomain
  .map((v) => ['DOMAIN-SUFFIX,' + v + ',' + route.inner + ',no-resolve'])
  .flat();

const innerProxyRules = __INNER_PROXY_DOMAIN__
  .split('\n')
  .filter(Boolean)
  .map((v) => ['DOMAIN-SUFFIX,' + v + ',' + route.innerProxy])
  .flat();

export default (config: ClashConfig, profileName: string): ClashConfig => {
  const dns = config.dns ?? {};
  dns['use-system-hosts'] = true;
  dns['default-nameserver'] = [
    'https://223.5.5.5/dns-query',
    'https://1.12.12.12/dns-query',
  ];
  dns.nameserver = [
    'https://doh.pub/dns-query',
    'https://dns.alidns.com/dns-query',
  ];
  dns['nameserver-policy'] = Object.fromEntries(
    innerDomain.map((v) => ['+.' + v, ['system']])
  );
  dns.fallback = [
    'https://1.0.0.1/dns-query',
    'https://208.67.222.222/dns-query',
    'https://208.67.220.220/dns-query',
  ];
  config.dns = dns;

  const proxies = (config.proxies || []).filter((v) => {
    return removeNames.every((n) => !v.name.includes(n));
  });
  proxies.forEach((v) => {
    v.name = `节点-${v.name}`;
  });

  const proxyGroups: ProxyGroup[] = [
    {
      name: route.proxy,
      type: 'select',
      proxies: proxies.map((v) => v.name),
    },
    {
      name: route.china,
      type: 'select',
      proxies: [route.proxy],
    },
    {
      name: route.inner,
      type: 'select',
      proxies: [route.proxy],
    },
    {
      name: route.innerProxy,
      type: 'select',
      proxies: [route.proxy],
    },
    {
      name: route.others,
      type: 'select',
      proxies: [route.proxy],
    },
  ];
  proxyGroups.forEach((v) => {
    v.proxies = ['DIRECT', ...v.proxies];
  });

  // https://clash.wiki/configuration/rules.html
  const rules = [
    'IP-CIDR,192.168.0.0/16,DIRECT',
    'IP-CIDR,10.0.0.0/8,DIRECT',
    'IP-CIDR,172.16.0.0/12,DIRECT',
    'IP-CIDR,127.0.0.0/8,DIRECT',
    'IP-CIDR,100.64.0.0/10,DIRECT',
    'DOMAIN,localhost,DIRECT',
    ...innerRules,
    ...innerProxyRules,
    'GEOIP,CN,' + route.china,
    'MATCH,' + route.others,
  ];

  config.proxies = proxies;
  config['proxy-groups'] = proxyGroups;
  config.rules = rules;

  return config;
};
