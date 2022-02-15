### 脚本
根据之前乌云上的漏洞案例编写的一个TP-LINK系列路由器wifi密码自动扫描的脚本
### 功能
根据IP段自动扫描并存储到sqlite3数据库，使用flask做展示界面
### 说明
使用此脚本之前你必须具备Python语言的基础知识
### 文件

TPLINK_KEY.db 存放了我已经扫描到的一些IP数据

list.py 用于web页面的展示（用法 python list.py）,默认使用127.0.0.1:5000作为web服务

scan.py 主要扫描脚本，数据存储在本地sqlite数据库

### 使用方法
#### 扫描

python3 scan.py 100 起始IP-结束IP

#### 展示

python3 list.py

### 更新
2022-02-15
> 去除远程部署相关文件，优化代码

> 更新IP查询接口（旧接口已经失效）

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
