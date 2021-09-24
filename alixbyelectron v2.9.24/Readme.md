2021/9/24上传了v2.9.24的完整源码

源码说明：

这里是完整的源码，可以直接编译通过，没有任何错误。个人开发，质量一般，勿喷勿扰，

源码有BUG，欢迎PR，

不接受开发环境配置/调试运行方面的提问，因为这都是基础，百度一下教程比我说的要详细。
如果你没有任何electron开发经验，小白羊的源码并不适合新手上手练习用

1.使用了quasar  http://www.quasarchs.com/
2.使用了vue3 https://v3.cn.vuejs.org/
3.使用了typescript https://www.tslang.cn/

依赖的插件，在package.json里

编译说明：
有过electron和vue开发经验的，自然明白，
1.配置开发环境
2.yarn install
3.配置好自己的eslint rules，解决一些语法规则，导致的编译错误
4.编译打包quasar build -m electron
5.把生成的app.asar 替换掉 “阿里小白羊版Win v2.9.24.7z”里面的app.asar即可运行

调试说明：
有过electron和vue开发经验的，自然明白，
1.配置开发环境
2.yarn install
3.配置好自己的eslint rules，解决一些语法规则，导致的编译错误
4.编译打包quasar dev -m electron
5.按照错误提示，从“阿里小白羊版Win v2.9.24.7z”里面复制缺少的文件到正确的路径 .quasar 里
6.调试运行
