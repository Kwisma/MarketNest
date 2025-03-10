# 更新软件源

```bash
sudo pkcon refresh && sudo pkcon update
```

## 垃圾清理

```bash
sudo apt autoremove
```

```bash
sudo apt-get --fix-broken install
```

## pkcon 取消代理

[原文参考地址](https://www.jianshu.com/p/4bd3c3be978f)

原来这个服务把代理藏在一个Sqlite的数据库里，在这里：

/var/lib/PackageKit/transactions.db

- 安装数据库可视化工具

```bash
sudo apt install sqlitebrowser
```

- 编辑数据库

```bash
sudo sqlitebrowser /var/lib/PackageKit/transactions.db
```

- 删除代理proxy
- 最后重启pkcon

```bash
sudo systemctl restart packagekit.service
```

## 修改为root登录

```bash
sudo nano /etc/pam.d/sddm
```

将第一个注释，第二个取消注释

> #auth    required        pam_succeed_if.so user != root quiet_success
   auth    sufficient      pam_succeed_if.so user ingroup nopasswdlogin

## 安装中文语包和繁体包

```bash
sudo apt-get install language-pack-gnome-zh-hans language-pack-kde-zh-hans language-pack-zh-hans language-pack-gnome-zh-hant language-pack-kde-zh-hant language-pack-zh-hant
```

## fcitx

```bash
sudo apt install fcitx5 fcitx5-chewing fcitx5-chinese-addons fcitx5-rime
```

## 安装语言支持

```bash
sudo apt-get install language-selector-gnome
```

## ui

```bash
sudo apt-get install fcitx-ui-qimpanel
```
