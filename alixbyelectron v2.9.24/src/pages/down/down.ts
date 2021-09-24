import { StoreDown, StoreUpload } from 'src/store';

export function topStartDown(isdown: boolean) {
  if (isdown) {
    const list = StoreDown.gSelectedDowningKey;
    StoreDown.mStartDowning(list);
  } else {
    const list = StoreUpload.gSelectedUploadingKey;
    StoreUpload.mStartUploading(list);
  }
}
export function topStartDownAll(isdown: boolean) {
  if (isdown) {
    StoreDown.mStartAllDowning();
  } else {
    StoreUpload.mStartAllUploading();
  }
}
export function topStopDown(isdown: boolean) {
  if (isdown) {
    const list = StoreDown.gSelectedDowningKey;
    StoreDown.mStopDowning(list);
  } else {
    const list = StoreUpload.gSelectedUploadingKey;
    StoreUpload.mStopUploading(list);
  }
}
export function topStopDownAll(isdown: boolean) {
  if (isdown) {
    StoreDown.mStopAllDowning();
  } else {
    StoreUpload.mStopAllUploading();
  }
}

export function topDeleteDown(isdown: boolean) {
  if (isdown) {
    const list = StoreDown.gSelectedDowningKey;
    StoreDown.mDeleteDowning(list);
  } else {
    const list = StoreUpload.gSelectedUploadingKey;
    StoreUpload.mDeleteUploading(list);
  }
}
export function topDeleteDownAll(isdown: boolean) {
  if (isdown) {
    StoreDown.mDeleteAllDowning();
  } else {
    StoreUpload.mDeleteAllUploading();
  }
}
export function topOrderDown(isdown: boolean) {
  if (isdown) {
    const list = StoreDown.gSelectedDowningKey;
    StoreDown.mOrderDowning(list);
  } else {
    const list = StoreUpload.gSelectedUploadingKey;
    StoreUpload.mOrderUploading(list);
  }
}
export function topDeleteDownedAll(isdown: boolean) {
  if (isdown) {
    StoreDown.mDeleteAllDowned();
  } else {
    StoreUpload.mDeleteAllUploaded();
  }
}

export function topDeleteDowned(DownID: string) {
  StoreDown.mDeleteDowned(DownID);
}
export function topDeleteUploaded(UploadID: string) {
  StoreUpload.mDeleteUploaded(UploadID);
}
export function onSelectAll(isdown: boolean) {
  if (isdown) {
    StoreDown.mChangSelectedFile({ DownID: 'all', ctrl: false, shift: false });
  } else {
    StoreUpload.mChangSelectedFile({ UploadID: 'all', ctrl: false, shift: false });
  }
}
