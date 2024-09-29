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

// 国内DNS服务器
const domesticNameservers = [
  'https://dns.alidns.com/dns-query', // 阿里云公共DNS
  'https://doh.pub/dns-query', // 腾讯DNSPod
  'https://doh.360.cn/dns-query', // 360安全DNS
];

// 国外DNS服务器
const foreignNameservers = [
  'https://1.0.0.1/dns-query', // Cloudflare(备)
  'https://208.67.222.222/dns-query', // OpenDNS(主)
  'https://208.67.220.220/dns-query', // OpenDNS(备)
  'https://194.242.2.2/dns-query', // Mullvad(主)
  'https://194.242.2.3/dns-query', // Mullvad(备)
];

export default (config: ClashConfig, profileName: string): ClashConfig => {
  config.dns = {
    ...(config.dns || {}),
    'use-system-hosts': true,
    'enhanced-mode': 'fake-ip',
    'fake-ip-range': '198.18.0.1/16',
    'fake-ip-filter': [
      // 本地主机/设备
      '+.lan',
      '+.local',
      // Windows网络出现小地球图标
      '+.msftconnecttest.com',
      '+.msftncsi.com',
      // QQ快速登录检测失败
      'localhost.ptlogin2.qq.com',
      'localhost.sec.qq.com',
      // 微信快速登录检测失败
      'localhost.work.weixin.qq.com',
    ],
    'default-nameserver': [
      'https://223.5.5.5/dns-query',
      'https://1.12.12.12/dns-query',
    ],
    nameserver: [...domesticNameservers, ...foreignNameservers],
    'proxy-server-nameserver': [...domesticNameservers, ...foreignNameservers],
    'nameserver-policy': {
      ...Object.fromEntries(innerDomain.map((v) => ['+.' + v, ['system']])),
      'geosite:private,cn,geolocation-cn': domesticNameservers,
      'geosite:google,youtube,telegram,gfw,geolocation-!cn': foreignNameservers,
    },
    fallback: [
      'https://1.0.0.1/dns-query',
      'https://208.67.222.222/dns-query',
      'https://208.67.220.220/dns-query',
    ],
  };

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
