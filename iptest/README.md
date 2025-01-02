# 批量获取ip

更换初始数据即可开始

## 安装依赖

```bash
apt install golang-go
npm install -P
```

## 运行

整理并去重

```bash
node extraction.js
```

测试有效ip

- 参数说明

- `file` 默认输入文件 `ip.txt` IP地址文件名称,格式为 ip port ,就是IP和端口之间用空格隔开
- `outfile` 默认输出文件 `ip.csv` 输出文件名称
- `max` 默认并发 `100` 并发请求最大协程数
- `speedtest` 默认并发 `5` 下载测速协程数量,设为0禁用测速
- `url` 默认测速地址 `speed.cloudflare.com/__down?bytes=500000000` 测速文件地址
- `tls` 默认参数 `true` 是否启用TLS

```bash
go run iptest.go -file extraction_ip.txt -outfile detected_ip.csv -max 50
```

提取有速度的ip并整理为指定格式

```bash
node detected.js
```
