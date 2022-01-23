import DownDAL from '@/store/downdal'
import UploadDAL from '@/store/uploaddal'

export function topStartDown(isdown: boolean) {
  if (isdown) {
    const list = DownDAL.QuerySelectedFileKeys()
    DownDAL.mStartDowning(list)
  } else {
    const list = UploadDAL.QuerySelectedFileKeys()
    UploadDAL.mStartUploading(list)
  }
}
export function topStartDownAll(isdown: boolean) {
  if (isdown) {
    DownDAL.mStartAllDowning()
  } else {
    UploadDAL.mStartAllUploading()
  }
}

export function topStopDown(isdown: boolean) {
  if (isdown) {
    const list = DownDAL.QuerySelectedFileKeys()
    DownDAL.mStopDowning(list)
  } else {
    const list = UploadDAL.QuerySelectedFileKeys()
    UploadDAL.mStopUploading(list)
  }
}
export function topStopDownAll(isdown: boolean) {
  if (isdown) {
    DownDAL.mStopAllDowning()
  } else {
    UploadDAL.mStopAllUploading()
  }
}

export function topDeleteDown(isdown: boolean) {
  if (isdown) {
    const list = DownDAL.QuerySelectedFileKeys()
    DownDAL.mDeleteDowning(list)
  } else {
    const list = UploadDAL.QuerySelectedFileKeys()
    UploadDAL.mDeleteUploading(list)
  }
}
export function topDeleteDownAll(isdown: boolean) {
  if (isdown) {
    DownDAL.mDeleteAllDowning()
  } else {
    UploadDAL.mDeleteAllUploading()
  }
}
export function topOrderDown(isdown: boolean) {
  if (isdown) {
    const list = DownDAL.QuerySelectedFileKeys()
    DownDAL.mOrderDowning(list)
  } else {
    const list = UploadDAL.QuerySelectedFileKeys()
    UploadDAL.mOrderUploading(list)
  }
}

export function topDeleteDownedAll(isdown: boolean) {
  if (isdown) {
    DownDAL.mDeleteAllDowned()
  } else {
    UploadDAL.mDeleteAllUploaded()
  }
}

export function topDeleteDowned(DownID: string) {
  DownDAL.mDeleteDowned(DownID)
}
export function topDeleteUploaded(UploadID: string) {
  UploadDAL.mDeleteUploaded(UploadID)
}
