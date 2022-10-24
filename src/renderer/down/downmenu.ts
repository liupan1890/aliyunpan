import DownDAL from './downdal'
import UploadDAL from '../transfer/uploaddal'
import UploadingDAL from '../transfer/uploadingdal'

export function topStartDown(isdown: boolean) {
  if (isdown) {
    DownDAL.DowningState(false, true)
  } else {
  }
}
export function topStartDownAll(isdown: boolean) {
  if (isdown) {
    DownDAL.DowningState(true, true)
  } else {
  }
}

export function topStopDown(isdown: boolean) {
  if (isdown) {
    DownDAL.DowningState(false, false)
  } else {
  }
}
export function topStopDownAll(isdown: boolean) {
  if (isdown) {
    DownDAL.DowningState(true, false)
  } else {
  }
}

export function topDeleteDown(isdown: boolean) {
  if (isdown) {
    DownDAL.DowningDelete(false)
  } else {
    UploadingDAL.aUploadingDelete(false)
  }
}

export function topDeleteDownAll(isdown: boolean) {
  if (isdown) {
    DownDAL.DowningDelete(true)
  } else {
    UploadingDAL.aUploadingDelete(true)
  }
}

export function topDeleteDowned(isdown: boolean) {
  if (isdown) {
    DownDAL.DownedDelete(false)
  } else {
    UploadDAL.UploadedDelete(false)
  }
}

export function topDeleteDownedAll(isdown: boolean) {
  if (isdown) {
    DownDAL.DownedDelete(true)
  } else {
    UploadDAL.UploadedDelete(true)
  }
}
