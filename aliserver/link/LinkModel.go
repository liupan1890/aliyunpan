package link

type LinkLogModel struct {
	//完整短链接
	Link string `json:"Link"`
	//记录时间
	LogTime int64 `json:"LogTime"`
	//自己创建
	IsCreater bool `json:"IsCreater"`
}

//LinkLogOrder 时间排序
type LinkLogOrder []*LinkLogModel

func (a LinkLogOrder) Len() int           { return len(a) }
func (a LinkLogOrder) Less(i, j int) bool { return a[i].LogTime > a[j].LogTime }
func (a LinkLogOrder) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
