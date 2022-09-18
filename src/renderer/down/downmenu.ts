import DownDAL from './downdal'
import UploadDAL from './uploaddal'

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
    UploadDAL.aUploadingDelete(false)
  }
}

export function topDeleteDownAll(isdown: boolean) {
  if (isdown) {
    DownDAL.DowningDelete(true)
  } else {
    UploadDAL.aUploadingDelete(true)
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
