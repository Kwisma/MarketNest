# **Mihomo 路由规则模板**

示例一

```yaml

# 配置代理提供者
proxy-providers:
  provider:
    <<: *p
    url: "订阅链接"
    path: ./proxies/provider.yaml
u: &u
  type: url-test
  tolerance: 1
  strategy: consistent-hashing
  lazy: true
  use:
    - provider

```

示例二（以此类推）

```yaml
# 配置代理提供者
proxy-providers:
  provider:
    <<: *p 
    url: "订阅链接"
    path: ./proxies/provider.yaml
  provider2:
    <<: *p 
    url: "订阅链接2"
    path: ./proxies/provider2.yaml
u: &u
  type: url-test
  tolerance: 1
  strategy: consistent-hashing 
  lazy: true
  use:
    - provider
    - provider2
```
