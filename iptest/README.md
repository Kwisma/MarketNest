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
node ip_init.js
```

测试有效ip

- 参数说明

- `file` 默认输入文件 `ip.txt` IP地址文件名称,格式为 ip port ,就是IP和端口之间用空格隔开
- `outfile` 默认输出文件命名称 `ip.csv`
- `max` 默认并发 `100` 并发请求最大协程数
- `speedtest` 默认并发 `5` 下载测速协程数量,设为0禁用测速
- `url` 默认测速地址 `speed.cloudflare.com/__down?bytes=500000000` 测速文件地址
- `tls` 默认参数 `true` 是否启用TLS

```bash
go run iptest.go -file ip_tq.txt -outfile ip_tq.csv
```

提取有速度的ip并整理为指定格式

```bash
node ip_tq.js
```

## 格式转换

多个/单个 XLSX 转 CSV

多个 CSV 合并

- init.csv 为输出文件名

```bash
node csv_hb.js init.csv 文件.csv 文件2.xlsx
```

也可以指定目录合并

```bash
node csv_hb.js init.csv ./ipfofa
```

## js格式化

安装工具 
```bash
npm install --global prettier
```

格式化文件

```bash
prettier --write ip_init.js
```
