# 参数

```bash
curl https://get.acme.sh | sh -s email=d342jxc@gmail.com
```

```bash
acme.sh --set-default-ca --server letsencrypt
```

```bash
echo 'alias acme.sh=~/.acme.sh/acme.sh' >> ~/.bashrc
source ~/.bashrc
```

```bash
export CF_Key="xxx" 
export CF_Email="xxx@gmail.com"
```

```bash
acme.sh --issue --dns dns_cf -d example.com -d *.example.com
```

```bash
acme.sh --install-cert -d 'example.com' \
--key-file       /etc/nginx/ssl/example.com/example.com.key  \
--fullchain-file /etc/nginx/ssl/example.com/example.com.crt \
--reloadcmd     "service nginx force-reload"
```

```bash
acme.sh --install-cert -d '*.example.com' \
--key-file       /etc/nginx/ssl/example.com/example.com.key  \
--fullchain-file /etc/nginx/ssl/example.com/example.com.crt \
--reloadcmd     "service nginx force-reload"
```
