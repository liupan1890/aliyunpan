package aliyun

import (
	"bytes"
	"crypto/sha1"
	"encoding/base64"
	"io"
	"os"
	"strconv"
	"sync"
)

const (
	csBlockBits = 22               // 2 ^ 22 = 4M
	csBlockSize = 1 << csBlockBits // 4M
)

func blockCount(size int64) int {
	return int((size + (csBlockSize - 1)) >> csBlockBits)
}

func computeSha1(b []byte, r io.Reader) ([]byte, error) {
	h := sha1.New()
	_, err := io.Copy(h, r)
	if err != nil {
		return nil, err
	}
	return h.Sum(b), nil
}

type hashData struct {
	AllBlocksSha1 []byte
	WaitHash      sync.WaitGroup
	IsError       bool
}

func computeFileSha1Buff(data *hashData, index int, buff []byte) {
	h := sha1.New()
	n, err := h.Write(buff)
	if n == len(buff) && err == nil {
		b := []byte{}
		b = h.Sum(b)
		s := index * 20
		for i := 0; i < len(b); i++ {
			data.AllBlocksSha1[s+i] = b[i]
		}
		data.WaitHash.Done()
		return
	}
	data.IsError = true
	data.WaitHash.Done()
}

//ComputeFileEtag 计算一个文件的6盘hash
func ComputeFileEtag(filename string) (etag string, err error) {
	f, err := os.Open(filename)
	if err != nil {
		return
	}
	defer f.Close()

	fi, err := f.Stat()
	if err != nil {
		return
	}

	fsize := fi.Size()
	innerBlockCount := blockCount(fsize)
	var tag []byte

	if innerBlockCount <= 1 { // file size <= 4M
		tag, err = computeSha1([]byte{0x16}, f)
		if err != nil {
			return
		}
	} else { // file size > 4M
		var allBlocksSha1 []byte

		for i := 0; i < innerBlockCount; i++ {
			body := io.LimitReader(f, csBlockSize)
			allBlocksSha1, err = computeSha1(allBlocksSha1, body)
			if err != nil {
				return
			}
		}

		tag, _ = computeSha1([]byte{0x96}, bytes.NewReader(allBlocksSha1))
	}

	etag = base64.URLEncoding.EncodeToString(tag)
	etag += strconv.FormatInt(fsize, 36)
	return
}

//ComputeFileEtagMutil 并发计算一个文件的6盘hash
func ComputeFileEtagMutil(filename string, addfilesize bool) (etag string, err error) {
	f, err := os.Open(filename)
	if err != nil {
		return "", err
	}
	defer f.Close()

	fi, err := f.Stat()
	if err != nil {
		return "", err
	}

	fsize := fi.Size()
	innerBlockCount := blockCount(fsize)
	var tag []byte

	if innerBlockCount <= 1 { // file size <= 4M
		tag, err = computeSha1([]byte{0x16}, f)
		if err != nil {
			return "", err
		}
	} else { // file size > 4M

		data := hashData{
			AllBlocksSha1: make([]byte, 20*innerBlockCount),
		}
		for i := 0; i < innerBlockCount; i++ {
			readlen := csBlockSize
			if i == (innerBlockCount - 1) {
				readlen = int(fsize - int64(i*csBlockSize))
			}
			var buff = make([]byte, readlen)
			n, err := f.Read(buff)
			if n == readlen && err == nil {
				data.WaitHash.Add(1)
				computeFileSha1Buff(&data, i, buff[:])
			} else {
				data.IsError = true
			}
		}
		data.WaitHash.Wait()
		if data.IsError {
			return "", err
		}
		tag, _ = computeSha1([]byte{0x96}, bytes.NewReader(data.AllBlocksSha1))
	}

	etag = base64.URLEncoding.EncodeToString(tag)
	if addfilesize {
		etag += strconv.FormatInt(fsize, 36)
	}
	return etag, nil
}
