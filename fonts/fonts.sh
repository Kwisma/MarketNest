#!/bin/bash

# 搜索中文字体软件包描述
search_results=$(apt-cache search fonts | grep Chinese)

# 提取软件包名称
package_names=$(echo "$search_results" | awk '{print $1}')

# 检查当前用户是否为管理员
if [ $(id -u) -eq 0 ]; then
  apt_cmd="apt install"
else
  apt_cmd="sudo apt install"
fi

# 安装匹配的软件包
$apt_cmd -y $package_names
