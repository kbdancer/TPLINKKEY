### 脚本
根据之前乌云上的漏洞案例编写的一个TP-LINK系列路由器wifi密码自动扫描的脚本
### 功能
根据IP段自动扫描并存储到sqlite3数据库，使用Pyweb做展示界面
### 说明
使用此脚本之前你必须具备Python语言的基础知识
### 文件
TPLINKKEY.db 存刚了我已经扫描到的一些IP数据

fixmac.py 用于修复之前IP数据库里面的一些mac地址问题（基本上用不到）

list.py 用于web页面的展示（用法 python list.py 8080）

telnetkey.py 主要扫描脚本