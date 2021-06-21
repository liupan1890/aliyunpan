package aliyun

import (
	"bytes"
	"crypto/sha1"
	"errors"
	"fmt"
	"io"
	"log"
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

//ComputeAliFileSha1 计算一个文件的sha1
func ComputeAliFileSha1(filePtr *os.File, size int64) (hash AliFileHash, err error) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ComputeAliFileSha1Error ", " error=", errr)
			err = errors.New("sha1 error")
		}
	}()
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

func ComputeAliBuffSha1(filePtr *bytes.Reader, size int64) (hash AliFileHash, err error) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ComputeAliBuffSha1Error ", " error=", errr)
			err = errors.New("sha1 error")
		}
	}()

	//filePtr := bytes.NewReader(buff.Bytes())

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
