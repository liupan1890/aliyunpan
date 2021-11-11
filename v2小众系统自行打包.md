> 精力有限，我只打包好了win/linux64/mac64系统可以运行的版本。其它系统有需要的用户需要自己打包

#### 自定义系统的打包步骤
1. 下载electron
2. 复制文件

就是这么简单，下面我们以打包linux-arm64为例

#### 1.下载electron
打开electron的淘宝镜像，里面提供了已经编译好可以运行的electron压缩包。

> https://npm.taobao.org/mirrors/electron/12.0.9/

根据你想要打包的系统自己下载对应的压缩包就好了，这里下载的是`electron-v12.0.9-linux-arm64.zip`

下载后随便解压缩到一个文件夹，这里我们解压到`electron`文件夹
解压后，在`electron` 文件夹里面有一个 `electron`文件，需要你手动修改这个文件的属性，在权限里勾选上“允许文件作为程序执行”

最后可以在终端执行命令`./electron`运行一下看看是否可以正常运行。能够正常运行说明你下对了


#### 2.复制文件

接下来需要复制小白羊的程序文件到`electron/resources`里面

1. 小白羊的程序文件哪里来的？
随便下载一份小白羊的程序就好了，里面都有了，也在`resources`文件夹里（例如下载阿里小白羊版Linux v2.8.1.pre.zip）

2. 删除`electron/resources/default_app.asar` 这个文件没用了删除掉

3. 复制通用文件,下面列出的文件直接复制到`electron/resources`里就可以，全平台通用的
``````
app.asar
app.ico
app.png
aria2.conf
``````

4. 复制特定平台文件
``````
aria2c.exe / aria2c
MPV 文件夹
``````



##### aria2c (linux/mac) / aria2c.exe (windows) 
这一个文件是aria2下载软件，需要复制你对应的平台的编译版本（这里是linux-arm64）

https://github.com/aria2/aria2/releases  官方提供了win32 win64 mac linux64

https://github.com/P3TERX/Aria2-Pro-Core 提供了linux-amd64/linux-arm64/linux-armhf/linux-i386

https://github.com/q3aql/aria2-static-builds 提供了linux-gnu-32/linux-gnu-64/linux-gnu-arm-rbpi/win-32/win-64

其他系统的自己寻找，既然你用到了，你肯定能找到

这里我们从Aria2-Pro-Core下载了`aria2-1.35.0-static-linux-arm64.tar.gz`解压缩得到了`aria2c`，把它复制到`electron/resources`里，并且修改可执行权限


##### MPV文件夹
这里面是MPV播放器，在线预览视频时会用到，在我发布的win/mac的小白羊压缩包里都集成了这个文件夹，直接复制就可以

linux系统特殊，因为找不到linux上发布的完整的MPV播放器文件，所以linux系统只能手动安装

安装方式一：在应用商店里搜索MPV安装

安装方式二：在终端执行命令“sudo apt install mpv”安装




#### 好了，大功告成了，可以运行electron了

注：linux下，直接双击'electron'这个文件并不能启动，必须在终端使用命令'./electron'才能启动。因为electron这个文件被发布为共享库而不是可执行程序，所以需要使用终端命令调用启动



