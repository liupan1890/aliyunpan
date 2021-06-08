package localhost

import (
	"aliserver/download"
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"
)

//GetPing 检查连接到2020
func GetPing() bool {
	response, _ := http.Get("http://localhost:29385/ping")
	if response != nil && response.StatusCode == http.StatusOK {
		if response.Header.Get("x-md-by") == "xiaobaiyang" {
			return true //成功连接到一个实例，直接退出
		}
	}
	return false
}

// quitChan HTTP服务退出消息
var quitChan = make(chan os.Signal)

// srv HTTP服务
var srv *http.Server = nil

// Port 绑定的端口29385
var Port = "29385"

//ListenServer 等待退出信号(会阻塞运行，go 调用)
// 会绑定端口，如果端口被占用，会触发退出信号
func ListenServer() {
	port := "localhost:" + Port
	srv = &http.Server{Addr: port, Handler: &Router{}}
	log.Println("Port:", port)
	println("Port:", port)
	err := srv.ListenAndServe()

	if err != nil && err != http.ErrServerClosed {
		log.Println("Start ServerError: ", err)
		quitChan <- os.Interrupt //最后触发退出信号
	}
}

//WaitingUntilStopServer 关闭服务(阻塞,一直等待信号)
func WaitingUntilStopServer() {
	// kill (no param) default send syscall.SIGTERM
	// kill -2 is syscall.SIGINT
	// kill -9 is syscall.SIGKILL but can't be catch, so don't need add it
	signal.Notify(quitChan, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)
	s := <-quitChan
	log.Println("Shutting down server: ", s)
	close(quitChan)
	// The context 设置3秒延时,去处理剩余的链接
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	srv.Shutdown(ctx)
}

//Router 路由器结构
type Router struct{}

//ServeHTTP 路由匹配与请求分发
func (mux *Router) ServeHTTP(writer http.ResponseWriter, req *http.Request) {
	defer func() {
		if err := recover(); err != nil {
			log.Println("ServeHTTPError ", " error=", err)
			http.Error(writer, "ServeHTTPError", http.StatusServiceUnavailable)
		}
	}()
	//RemoteAddr:"127.0.0.1:6178"
	//req.Host "localhost:29385"
	//[::1]
	local := "localhost:" + Port

	if req.Host != local {
		writer.Header().Set("Content-Type", "text/html; charset=utf-8")
		writer.Header().Set("Access-Control-Allow-Origin", "*")
		writer.Header().Set("x-md-by", "xiaobaiyang")
		writer.WriteHeader(http.StatusForbidden)
		return //乱捕获
	}

	path := req.URL.Path
	if strings.Index(path, "?") > 0 {
		path = path[0:strings.Index(path, "?")] //去掉？之后的
	}
	if strings.Index(path, "/ ") == 0 { //修正可能出现的自动附加参数BUG
		http.Redirect(writer, req, "http://"+local+"/", http.StatusFound)
		return
	}
	switch path {
	case "/quit": //退出程序
		ActionPing(writer, req)
		quitChan <- os.Interrupt
	case "/ping": //ping检测
		ActionPing(writer, req)
	case "/url":
		ActionURL(writer, req)
	default:
		http.NotFound(writer, req) //找不到返回404

	}

}

func StopServer() {
	download.DowningStopAll()
	quitChan <- os.Interrupt
}
