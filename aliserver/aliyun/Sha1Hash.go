package aliyun

import (
	"crypto/sha1"
	"errors"
	"fmt"
	"io"
	"os"
)

func computeSha1(r io.Reader) ([]byte, error) {
	h := sha1.New()
	_, err := io.Copy(h, r)
	if err != nil {
		return nil, err
	}
	return h.Sum(nil), nil
}

type AliFileHash struct {
	Pre_hash string
	Hash     string
}

//ComputeFileEtag 计算一个文件的sha1
func ComputeAliFileSha1(filePtr *os.File, size int64) (hash AliFileHash, err error) {

	hashbytes, err := computeSha1(filePtr)
	if err != nil {
		return hash, errors.New("sha1 error")
	}
	hash.Hash = fmt.Sprintf("%X", hashbytes)

	filePtr.Seek(0, 0)
	if size > 1024 {
		size = 1024
	}
	perbody := io.LimitReader(filePtr, size)
	prehashbytes, err := computeSha1(perbody)
	if err != nil {
		return hash, errors.New("sha1 error pre")
	}
	hash.Pre_hash = fmt.Sprintf("%X", prehashbytes)

	return hash, nil
}
