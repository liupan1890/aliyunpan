#### window系统上，在v2.8.15版本开始支持使用Potplayer替换掉默认的MPV播放器

这里是临时的复制文件方式，使用Potplayer，在以后以后的版本中会在设置里增加一个设置，让用户手动选择potplayer.exe文件即可，那时就不需要复制了


#### 具体的操作：

1.下载小白羊v2.8.15  解压到“阿里云盘小白羊版v2”

2.下载Potplayer 不管是解压还是安装，最终找到Potplayer.exe所在的文件夹

(注：如果你已经安装过Potplayer，不需要重新安装，直接找到Potplayer.exe所在的文件夹就行了)

3.把Potplayer的整个文件夹复制到“阿里云盘小白羊版v2\resources\”里面

#### 最终得到：
'阿里云盘小白羊版v2\resources\Potplayer\Potplayer.exe'


退出后重新启动小白羊生效

### 需要注意的是：

第一：Potplayer必须是20210127以后的版本，推荐安装最新版

#### 第二：有的Potplayer文件夹里只有Potplayermini.exe 没有Potplayer.exe  需要手动把Potplayermini.exe 改名成 Potplayer.exe

第三：有的Potplayer文件夹里只有Potplayer64.exe 没有Potplayer.exe  需要手动把Potplayer64.exe 改名成 Potplayer.exe

第四：遇到在线预览视频没有画面只有声音的，请自行安装解码器(OpenCodec/LAVFilters)

安装解码器参阅

http://www.potplayercn.com/course/OpenCodec.html

http://www.potplayercn.com/course/2994.html



最后附上最终的文件目录树：
``````

阿里云盘小白羊版v2
│  chrome_100_percent.pak
│  chrome_200_percent.pak
│  d3dcompiler_47.dll
│  ffmpeg.dll
│  icudtl.dat
│  libEGL.dll
│  libGLESv2.dll
│  resources.pak
│  snapshot_blob.bin
│  v2.8.15.txt
│  v8_context_snapshot.bin
│  vk_swiftshader.dll
│  vk_swiftshader_icd.json
│  vulkan-1.dll
│  阿里云盘小白羊版v2.exe
│  
├─locales
├─resources
│  │  app.asar
│  │  app.ico
│  │  app.png
│  │  aria2.conf
│  │  aria2c.exe
│  │  filehash32.exe
│  │  
│  ├─MPV
│  │  │  d3dcompiler_43.dll
│  │  │  mpv.com
│  │  │  mpv.exe
│  │              
│  └─PotPlayer
│      │  Alarm.wav
│      │  ATextOut.dll
│      │  CaptureUWP.dll
│      │  CmdLine.txt
│      │  d3dcompiler_47.dll
│      │  d3dx9_43.dll
│      │  DaumCrashHandler.dll
│      │  DesktopHook.dll
│      │  DesktopHook.exe
│      │  DesktopHook64.dll
│      │  DesktopHook64.exe
│      │  DTDrop.exe
│      │  D_Exec.exe
│      │  ffcodec.dll
│      │  FileList.txt
│      │  GameCaptureHook.dll
│      │  GameCaptureHook64.dll
│      │  KillPot.exe
│      │  LGPL.TXT
│      │  License.txt
│      │  MediaDB.dll
│      │  PotIcons.dll
│      │  PotPlayer.dll
│      │  PotPlayer.exe
│      │  PotPlayer.ini
│      │  PotPlayerXP.exe
│      │  PotScreenSaver.scr
│      │  
│      ├─AviSynth
│      ├─Capture
│      ├─Extension
│      ├─History
│      ├─IconPack
│      ├─Language
│      ├─Logos
│      ├─Menus
│      ├─Module
│      ├─Playlist
│      ├─PxShader
│      ├─Skins
│      ├─UrlList
│      │      
│      └─VapourSynth
│              Histogram.vpy
│              motioninterpolation.vpy
│              
└─swiftshader
        libEGL.dll
        libGLESv2.dll
``````
