![Harbors](http://code.itharbors.com/images/logo.png)

Harbors
=======

##Harbors是什么?

一个基于NodeJS的一个轻量级WEB服务器

让您使用js简单的构建出一个WEB站点, 基于原生NodeJS语法, 易学易用.

##Harbors怎么使用?

####1. 简单的安装方式

    npm -g install harbors
    
如果是linux的话需要注意权限问题
    
###2. 构建第一个web站点

进入需要构建成服务器的文件夹, 并执行:

    harbors

这样就经可以使用http://localhost:3000/访问这个文件夹下的文件了

默认监听3000端口, 未绑定ip地址

###3. 创建新的web站点

    harbors -c website
    
命令会在当前目录下新建一个website文件夹，并创建基础的配置以及文件目录