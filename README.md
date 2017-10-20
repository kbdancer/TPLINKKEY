### 脚本
根据之前乌云上的漏洞案例编写的一个TP-LINK系列路由器wifi密码自动扫描的脚本
### 功能
根据IP段自动扫描并存储到sqlite3数据库，使用flask做展示界面
### 说明
使用此脚本之前你必须具备Python语言的基础知识
### 文件
local 目录下存放本地扫描文件

local/TPLINKKEY.db 存放了我已经扫描到的一些IP数据

local/list.py 用于web页面的展示（用法 python list.py）,默认使用127.0.0.1:5000作为web服务

local/transdata.py 用于将本地的数据存储到远程，转储的作用（只转储有mac地址的数据）

local/scan.py 主要扫描脚本，数据存储在本地sqlite数据库

remote 目录下存放分布扫描文件

remote/mysqldb/tplink.sql 为远程mysql数据库结构文件

remote/server/accesskey.php 存放在远程服务器，用于生成一个合法的key，方便管理

remote/server/savedata.php 存放在远程服务器，用于接收push过去的数据

remote/scan_remote.py 主要扫描脚本，数据直接存储到远程服务器
### 使用方法
#### 0x00

生成一个合法的key，GET请求 http://xxx.com/accesskey.php?email=1@q.com 即可获得一个key，key的作用主要用于提交数据时候的凭证，如果忘记了key，只需要再次请求这个地址，email填写原来的即可获取对应的key，email不存在的时候则会生成新的key
> 注意：这里的key默认设置为不需要审核即可用，相关字段在数据库中有设置，如果需要设置每个key的限额，可以增加字段并且在php中修改部分代码，如果需要设置key生成成功之后默认为未审核不可用状态则只需要修改accesskey.php中的sql语句checked值。

#### 0x01

存储数据使用POST方式，数据格式为{"email":"1@q.com","key":"asd654as6d5762376xdas","host":"......"},后端处理先验证key和email是否存在并且状态为可用的时候才允许存入数据。

### 更新
2017-10-20
> 扫描脚本使用Python3改写

> 前端js使用vue改写

> 修改了分页控件的方法

> 精简了部分代码

2017-02-20
> 新增分布扫描版本，扫描结果集中存储

> 修改目录结构

> 修改部分代码

> 更新使用方法

2017-02-19
> 封装sqlite3的方法为一个类，方便调用；

> 规范部分变量的命名规则；

> 更改数据库部分字段名，防止与系统冲突；

> 更改部分代码避免了sql注入

2017-01-11

> 使用 flask 重新改写WEB服务端

### 效果
![](https://raw.githubusercontent.com/kbdancer/TPLINKKEY/master/screencut/web.png)

![](https://raw.githubusercontent.com/kbdancer/TPLINKKEY/master/screencut/terminator.png)
