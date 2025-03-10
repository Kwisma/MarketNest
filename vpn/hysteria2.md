# hysteria2安装教程

安装脚本

```bash
bash <(curl -fsSL https://get.hy2.sh/)
```

自签证书

```bash
openssl req -x509 -nodes -newkey ec:<(openssl ecparam -name prime256v1) -keyout /etc/hysteria/server.key -out /etc/hysteria/server.crt -subj "/CN=bing.com" -days 36500 && sudo chown hysteria /etc/hysteria/server.key && sudo chown hysteria /etc/hysteria/server.crt
```

修改配置文件

```bash
cat << EOF > /etc/hysteria/config.yaml
listen: :4000 #监听端口
tls:
  cert: /etc/hysteria/server.crt
  key: /etc/hysteria/server.key

auth:
  type: password
  password: 098f01eb-7b21-4ea4-9e5a-02c36392ba58 #设置认证密码

masquerade:
  type: proxy
  proxy:
    url: https://bing.com #伪装网址
    rewriteHost: true
quic:
  initStreamReceiveWindow: 8388608 
  maxStreamReceiveWindow: 8388608 
  initConnReceiveWindow: 20971520 
  maxConnReceiveWindow: 20971520 
EOF
```

开放端口跳跃

```bash
# IPv4
iptables -t nat -A PREROUTING -p udp --dport 4000:8000 -j DNAT --to-destination :4000
# IPv6
ip6tables -t nat -A PREROUTING -p udp --dport 4000:8000 -j DNAT --to-destination :4000
```

开机自启

```bash
systemctl enable hysteria-server.service
```

启动

```bash
systemctl start hysteria-server.service
```

查看状态

```bash
systemctl status hysteria-server.service
```

重启

```bash
systemctl restart hysteria-server.service
```
