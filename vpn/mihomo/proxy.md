# 系统代理

编辑文件

```text
vim  /etc/profile
```

在文件最下面写入

```text
alias kclash="export ALL_PROXY=127.0.0.1:7890"
alias gclash="unset ALL_PROXY"
```

重载配置

```text
source /etc/profile
```

开启kclash，关闭gclash

```text
kclash
```

```text
gclash
```
