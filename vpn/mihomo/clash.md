# clash Linux安装

下载[clash](https://github.com/Dreamacro/clash)

```text
wget https://github.com/Dreamacro/clash/releases/download/v1.12.0/clash-linux-amd64-v1.12.0.gz
```

解压

```text
gzip -d clash-linux-amd64-v1.12.0.gz
```

移动到/usr/local/bin/clash并重命名

```text
mv clash-linux-amd64-v1.12.0 /usr/local/bin/clash
```

给执行权限

```text
chmod +x /usr/local/bin/clash
```

设置成服务

```text
vim /etc/systemd/system/clash.service
```

```text
[Unit]
Description=clash service
After=network.target
 
[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/clash
Restart=on-failure # or always, on-abort, etc
 
[Install]
WantedBy=multi-user.target
```

设置开机自启

```text
systemctl daemon-reload
systemctl enable clash
```

启动

```text
service clash start
```

## 配置面板

```text
cd ~/.config/clash
```

下载面板，解压，重命名

```text
wget https://github.com/haishanh/yacd/archive/gh-pages.zip
unzip gh-pages.zip
mv yacd-gh-pages/ dashboard/
```

配置面板

```text
external-ui: dashboard
```

secret: xxxx #设置访问密码

external-controller: 0.0.0.0:9090  #别忘记在服务器厂商开放端口号

external-ui: dashboard  #面板路径

## 修改系统代理

设置代理

```text
vim /etc/profile
```

全局代理(开关版)

```text
alias kclash="export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=socks5://127.0.0.1:7890"
alias gclash="unset  http_proxy  https_proxy  all_proxy"
```

开启代理

```text
kclash
```

关闭代理

```text
gclash
```

全局代理

```text
export http_proxy=127.0.0.1:9090
export https_proxy=127.0.0.1:9090
```

重载配置文件

```text
source /etc/profile
```

查看代理是否代理

```text
env|grep -i proxy
```

### 其他指令

查看服务状态

```text
service clash status
```

重启服务

```text
service clash restart
```

停止服务

```text
service clash stop
```
