package aliyun

import (
	"bytes"
	"crypto/tls"
	"errors"
	"log"
	"net/http"
)

func MemUpload(boxid string, parentid string, filename string, buff *[]byte) (err error) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("MemUploadError ", " error=", errr)
			err = errors.New("MemUploadError")
		}
	}()
	var buffer bytes.Buffer
	buffer.Write([]byte{0xEF, 0xBB, 0xBF})
	buffer.Write(*buff)
	size := int64(buffer.Len())
	reader := bytes.NewReader(buffer.Bytes())
	hash, err := ComputeAliBuffSha1(reader, size)
	if err != nil {
		return err
	}

	israpid, upload_id, file_id, upload_url, err := UploadCreatFile(boxid, parentid, filename, size, hash.Hash)
	if err != nil {
		return err
	}
	if israpid == false {
		reader.Seek(0, 0)
		request, err := http.NewRequest("PUT", upload_url, reader)
		if err != nil {
			return err
		}
		request.Header.Set("Expect", "100-continue")
		//var proxyurl, _ = url.Parse("http://192.168.31.75:8888")
		tr := &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
			//	Proxy:           http.ProxyURL(proxyurl),
		}
		resp, err := (&http.Client{Transport: tr}).Do(request)
		if err != nil {
			return err
		}
		defer resp.Body.Close()

		err = UploadFileComplete(boxid, parentid, filename, file_id, upload_id)
		if err != nil {
			return err
		}
	}
	return nil
}
