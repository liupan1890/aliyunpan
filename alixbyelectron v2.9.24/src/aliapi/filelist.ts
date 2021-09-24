import { IAliFileItem, IAliFileJson, IStatePanFile, IStatePanFileByDir, ITokenInfo, PanFileInfo } from 'src/store/models';
import { format } from 'quasar';
import AliHttp, { IUrlRespData } from './alihttp';
import { SQL, StoreRoot } from 'src/store';
import { ProtoPanFileInfo } from 'src/store/proto';

function IsSuccess(code: number) {
  return code >= 200 && code <= 300;
}

export default class AliFileList {
  static LimitMax = 100;
  static TempMap = new Map<string, IStatePanFileByDir>();
  static SaveTemp(from: string, user_id: string, drive_id: string, dir_id: string, list: IStatePanFile[]) {
    if (window.electronworker) return;
    const key = from + '-' + user_id + '-' + drive_id + '-' + dir_id;
    const temp = AliFileList.TempMap.get(key) || {
      user_id,
      drive_id,
      file_id: dir_id,
      loading: 0,
      filelist: list,
    };
    if (temp.filelist.length <= list.length) {
      temp.filelist = list;
      AliFileList.TempMap.set(key, temp);

      if (from == 'filelist' && StoreRoot.showDir.file_id == dir_id && list.length % 200 == 0) StoreRoot.mChangSelectedDirFileList({ dir_id: dir_id, items: list });
      if (StoreRoot.showDir.file_id == dir_id && StoreRoot.showDir.loading > 0) {
        if (from == 'favorlist') StoreRoot.mChangSelectedDirFileList({ dir_id: dir_id, items: list });
        if (from == 'trashlist') StoreRoot.mChangSelectedDirFileList({ dir_id: dir_id, items: list });
      }
    }
  }
  static GetTemp(from: string, user_id: string, drive_id: string, dir_id: string) {
    const key = from + '-' + user_id + '-' + drive_id + '-' + dir_id;
    return AliFileList.TempMap.get(key);
  }
  static DeleteTemp(from: string, user_id: string, drive_id: string, dir_id: string) {
    const key = from + '-' + user_id + '-' + drive_id + '-' + dir_id;
    AliFileList.TempMap.delete(key);
  }

  static getFileIcon(category: string | undefined, ext: string | undefined, size: number): string[] {
    if (!ext) {
      ext = '';
    }

    ext = '.' + ext.toLowerCase().replace('.', '').trim() + '.';

    //iconfile-wps
    //iconfile-psd iconfile-eps

    //JPEG、BMP、PNG、JPG
    if (';.jpeg.bmp.png.jpg.'.indexOf(ext) > 0 || category == 'image') {
      return ['image', 'iconfile-img'];
    }
    if (';.apng.avif.webp.tiff.jp2.gif.ico.'.indexOf(ext) > 0) {
      return ['image2', 'iconfile-img'];
    }
    //livp 不支持 heic webp 有限支持

    //MP4、3GP、AVI、FLV、Webm、MOV、AMR、ASF、VCD（MPEG-1 video）、DVD（MPEG-2）、M4V、3G2、MJPEG、DATA、AVI（H261，H263，H264）、DV、GXF、CAVS video、DNxHD、FFM
    if (
      ';.mp4.3gp.avi.flv.webm.mov.amr.asf.vcd.dvd.mpeg.mpg.mpg2.m4v.3g2.mjpeg.data.h261.h263.h264.i263.i261.i264.dv.gxf.cavs.ffm.'.indexOf(ext) > 0 ||
      (category == 'video' && size > 5 * 1024 * 1024)
    ) {
      return ['video', 'iconfile_video'];
    }
    if (ext == '.ts.' && size > 5 * 1024 * 1024) return ['video2', 'iconfile_video'];
    if (';.3iv.cpk.divx.hdv.fli.f4v.f4p.m2t.m2ts.mts.trp.mkv.mp4.mpg4.nsv.nut.nuv.rm.rmvb.vob.wmv.mk3d.hevc.yuv.y4m.'.indexOf(ext) > 0) {
      return ['video2', 'iconfile_video'];
    }

    //MP3、FLAC、AC3、Ogg、ADX、WAV、AIFF、ALAW、AU、DTS、MP2、Dirac、HLS 4
    if (';.mp3.flac.ac3.ogg.adx.wav.aiff.alaw.au.dts.mp2.'.indexOf(ext) > 0 || category == 'audio') {
      return ['audio', 'iconfile-audio'];
    }
    if (';.ape.aac.cda.dsf.dtshd.eac3.m1a.m2a.m4a.mka.mpa.mpc.opus.ra.tak.tta.wma.wv'.indexOf(ext) > 0) {
      return ['audio2', 'iconfile-audio'];
    }
    //PDF、WORD、TXT、PPT、EXCEL
    if (ext == '.pdf.') return ['doc', 'iconfile-pdf'];
    if (ext == '.doc.' || ext == '.docx.') return ['doc', 'iconfile-doc'];
    if (ext == '.ppt.' || ext == '.pptx.') return ['doc', 'iconfile-ppt'];
    if (ext == '.xls.' || ext == '.xlsx.') return ['doc', 'iconfile-xsl'];
    if (ext == '.txt.') return ['file', 'iconfile_txt2'];
    //if (category == 'doc') return ['doc', 'iconfont iconfile-doc'];

    //wps.wpt.et.ett.dps.rtf

    if (ext == '.rar.') return ['zip', 'iconfile-rar'];
    if (ext == '.zip.') return ['zip', 'iconfile-zip'];

    if (ext == '.tar.') return ['file', 'iconfile-tar'];
    if (ext == '.7z.') return ['file', 'iconfile-7z'];
    if (ext == '.psd.') return ['file', 'iconfile-psd'];
    if (ext == '.eps.') return ['file', 'iconfile-eps'];
    if (';.wps.wpt.et.ett.dps.'.indexOf(ext) > 0) return ['file', 'iconfile-wps'];

    return ['file', 'iconwenjian'];
  }

  static getFileInfo(item: IAliFileItem): IStatePanFile {

    const size = item.size ? item.size : 0;
    const date = new Date(item.updated_at);
    const y = date.getFullYear().toString();
    let m: number | string = date.getMonth() + 1;
    m = m < 10 ? '0' + m.toString() : m.toString();
    let d: number | string = date.getDate();
    d = d < 10 ? '0' + d.toString() : d.toString();
    let h: number | string = date.getHours();
    h = h < 10 ? '0' + h.toString() : h.toString();
    let minute: number | string = date.getMinutes();
    minute = minute < 10 ? '0' + minute.toString() : minute.toString();
    let second: number | string = date.getSeconds();
    second = second < 10 ? '0' + second.toString() : second.toString();

    let illegal = false;
    if (item.thumbnail && item.thumbnail.indexOf('illegal_thumbnail') > 0) {
      illegal = true;
    }
    const isdir = item.type !== 'file';

    let videopreview = item.video_preview_metadata?.template_list;
    if (videopreview == undefined) videopreview = [{ template_id: '', status: '' }];

    const info: PanFileInfo = {
      domainid: item.domain_id || '',
      filetype: item.type || '',
      status: item.status || '',
      crc64: item.crc64_hash || '',
      url: item.url || '',
      downloadurl: item.download_url || '',
      isimage: item.image_media_metadata ? true : false,
      isvideo: item.video_media_metadata ? true : false,
      isaudio: item.video_preview_metadata?.audio_template_list != undefined,
      isvideopreview: videopreview[0].status == 'finished',
      isWeiFa: illegal,
    };
    if (!item.thumbnail || !item.url || item.url.indexOf('x-oss-process') < 0) {
      info.url = ''; 
    }
    const add: IStatePanFile = {
      drive_id: item.drive_id,
      file_id: item.file_id,
      parent_file_id: item.parent_file_id,
      name: item.name,
      ext: item.file_extension?.toLowerCase() || '',
      starred: item.starred,
      time: date.getTime(),
      size: size,
      sizestr: format.humanStorageSize(size),
      timestr: y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second, 
      sha1: item.content_hash || '',
      thumbnail: item.thumbnail || '',
      width: item.image_media_metadata?.width || item.video_media_metadata?.width || item.video_preview_metadata?.width || 0,
      height: item.image_media_metadata?.height || item.video_media_metadata?.height || item.video_preview_metadata?.height || 0,
      duration: Math.ceil(Number.parseFloat(item.video_media_metadata?.duration?.toString() || item.video_preview_metadata?.duration?.toString() || '0')),
      icon: 'iconfolder',
      isDir: isdir,
      info: '',
      loading: 0,
    };
    if ((item.type == 'image' || item.type == 'image2') && !add.thumbnail && add.size < 2 * 1024 * 1024) {
      add.thumbnail = item.url || '';
      info.isimage = add.thumbnail != '';
    }
    if (add.size < 3 * 1024 * 1024 && add.thumbnail && ';.apng.avif.webp.tiff.jp2.gif.ico.'.indexOf('.' + add.ext + '.') > 0) {
      info.url = item.download_url || '';
      info.isimage = true;
    }
    if (info.isimage && (add.ext == 'livp' || add.ext == 'svg')) {
      info.isimage = false;
      add.thumbnail = '';
      info.url = '';
    }
    if (info.isvideo && add.width == 0 && info.isvideopreview == false && add.size < 30 * 1024 * 1024) {
      info.isvideo = false;
      add.thumbnail = '';
      info.url = '';
      info.filetype = '';
      item.category = ''; 
    }
    if (!isdir) {
      const type2 = AliFileList.getFileIcon(item.category, item.file_extension || item.mime_extension, item.size);
      info.filetype = type2[0];
      add.icon = type2[1];
      if (illegal) add.icon = 'iconweifa';
    }
    add.info = (ProtoPanFileInfo.encode(info).finish() as Buffer).toString('base64');

    return add;
  }

  static getFileInfoWorker(item: IAliFileItem): IStatePanFile {
    

    const size = item.size ? item.size : 0;

    let illegal = false;
    if (item.thumbnail && item.thumbnail.indexOf('illegal_thumbnail') > 0) {
      illegal = true;
    }
    const isdir = item.type !== 'file';

    let videopreview = item.video_preview_metadata?.template_list;
    if (videopreview == undefined) videopreview = [{ template_id: '', status: '' }];

    const add: IStatePanFile = {
      drive_id: item.drive_id,
      file_id: item.file_id,
      parent_file_id: item.parent_file_id,
      name: item.name,
      ext: item.file_extension?.toLowerCase() || '',
      starred: item.starred,
      time: 0,
      size: size,
      sizestr: format.humanStorageSize(size),
      timestr: '', 
      sha1: item.content_hash || '',
      thumbnail: '',
      width: item.image_media_metadata?.width || item.video_media_metadata?.width || item.video_preview_metadata?.width || 0,
      height: item.image_media_metadata?.height || item.video_media_metadata?.height || item.video_preview_metadata?.height || 0,
      duration: Math.ceil(Number.parseFloat(item.video_media_metadata?.duration?.toString() || item.video_preview_metadata?.duration?.toString() || '0')),
      icon: 'iconfolder',
      isDir: isdir,
      info: '',
      loading: 0,
    };

    if (!isdir) {
      const type2 = AliFileList.getFileIcon(item.category, item.file_extension || item.mime_extension, item.size);
      add.icon = type2[1];
      if (illegal) add.icon = 'iconweifa';
    }
    return add;
  }
  static _FileListOnePage(from: string, dir: IAliFileJson, onlydir: boolean, resp: IUrlRespData) {
    try {
      if (IsSuccess(resp.code)) {
        dir.next_marker = resp.body.next_marker;
        let findFile = false;
        const isworker = window.electronworker;
        for (let i = 0; i < resp.body.items.length; i++) {
          const item = resp.body.items[i] as IAliFileItem;
          const add = isworker ? this.getFileInfoWorker(item) : this.getFileInfo(item);
          if (add.isDir) {
            findFile = true;
            if (onlydir) continue; 
          }
          dir.items.push(add);
        }
        if (onlydir && findFile) dir.next_marker = '';
        if (isworker == false) AliFileList.SaveTemp(from, dir.m_user_id, dir.m_drive_id, dir.m_dir_id, dir.items);
        return true;
      } else if (resp.code == 404) {
        dir.items = [];
        dir.next_marker = '';
        return true;
      }
    } catch {}
    dir.next_marker = 'error';
    return false;
  }
  static async ApiFileListOnePage(dir: IAliFileJson, token: ITokenInfo, onlydir: boolean) {
    const url = 'adrive/v3/file/list';
    const postdata = {
      drive_id: dir.m_drive_id,
      parent_file_id: dir.m_dir_id,
      marker: dir.next_marker,
      limit: AliFileList.LimitMax,
      all: false,
      url_expire_sec: 14000,
      image_thumbnail_process: 'image/resize,w_400/format,jpeg',
      image_url_process: 'image/resize,w_1920/format,jpeg',
      video_thumbnail_process: 'video/snapshot,t_106000,f_jpg,ar_auto,m_fast,w_400',
      fields: '*',
      order_by: 'name',
      order_direction: 'ASC',
    };
    const resp = await AliHttp.Post(url, postdata, token);
    return AliFileList._FileListOnePage(onlydir ? 'dirlist' : 'filelist', dir, onlydir, resp);
  }

  static async ApiFileList(drive_id: string, dir_id: string, dir_name: string, token: ITokenInfo): Promise<IAliFileJson> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    const dir: IAliFileJson = {
      items: [],
      next_marker: '',
      m_time: 0,
      m_user_id: token.user_id,
      m_drive_id: drive_id,
      m_dir_id: dir_id,
      m_dir_name: dir_name,
    };
    do {
      const isget = await AliFileList.ApiFileListOnePage(dir, token, false);
      if (isget != true) {
        break; 
      }
    } while (dir.next_marker != '');
    if (dir.next_marker == '') {
      if (window.electronworker) {
        window.WinMsgToMain({ cmd: 'MainSaveFileListAllPage', from: 'filelist', user_id: dir.m_user_id, drive_id: dir.m_drive_id, dir_id: dir.m_dir_id, items: dir.items });
      } else {
        await SQL.SaveFileList(dir.m_user_id, dir.m_drive_id, dir.m_dir_id, dir.items);
      }
    }
    AliFileList.DeleteTemp('filelist', dir.m_user_id, dir.m_drive_id, dir.m_dir_id);
    return dir;
  }

  static async ApiDirList(drive_id: string, dir_id: string, dir_name: string, token: ITokenInfo): Promise<IAliFileJson> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    const dir: IAliFileJson = {
      items: [],
      next_marker: '',
      m_time: 0,
      m_user_id: token.user_id,
      m_drive_id: drive_id,
      m_dir_id: dir_id,
      m_dir_name: dir_name,
    };
    do {
      const isget = await AliFileList.ApiFileListOnePage(dir, token, true);
      if (isget != true) {
        break; 
      }
    } while (dir.next_marker != '');
    if (dir.next_marker == '') {
      if (window.electronworker) {
        //window.WinMsgToMain({ cmd: 'MainSaveFileListAllPage', from: 'dirlist', user_id: dir.m_user_id, drive_id: dir.m_drive_id, dir_id: dir.m_dir_id, items: dir.items });
      } else {
        //todo
      }
    }
    AliFileList.DeleteTemp('dirlist', dir.m_user_id, dir.m_drive_id, dir.m_dir_id);
    return dir;
  }

  static async ApiTrashFileListOnePage(dir: IAliFileJson, token: ITokenInfo, onlydir: boolean) {
    const url = 'v2/recyclebin/list';
    const postdata = {
      drive_id: dir.m_drive_id,
      marker: dir.next_marker,
      limit: AliFileList.LimitMax,
      all: false,
      url_expire_sec: 14000,
      image_thumbnail_process: 'image/resize,w_400/format,jpeg',
      image_url_process: 'image/resize,w_1920/format,jpeg',
      video_thumbnail_process: 'video/snapshot,t_10000,f_jpg,ar_auto,m_fast,w_800',
      fields: '*',
      order_by: 'updated_at',
      order_direction: 'DESC',
    };
    const resp = await AliHttp.Post(url, postdata, token);
    return AliFileList._FileListOnePage('trashlist', dir, onlydir, resp);
  }
  static trashLoading = false;
  
  static async ApiTrashFileList(drive_id: string, dir_id: string, dir_name: string, token: ITokenInfo): Promise<IAliFileJson> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    const dir: IAliFileJson = {
      items: [],
      next_marker: '',
      m_time: 0,
      m_user_id: token.user_id,
      m_drive_id: drive_id,
      m_dir_id: dir_id,
      m_dir_name: dir_name,
    };
    if (AliFileList.trashLoading) {
      dir.next_marker = 'loading';
      return dir;
    }
    AliFileList.trashLoading = true;
    do {
      const isget = await AliFileList.ApiTrashFileListOnePage(dir, token, false);
      if (isget != true) {
        break; 
      }

      if (dir.items.length >= 5000) dir.next_marker = ''; 
    } while (dir.next_marker != '');

    AliFileList.DeleteTemp('trashlist', dir.m_user_id, dir.m_drive_id, dir.m_dir_id);
    AliFileList.trashLoading = false;
    return dir;
  }

  static async ApiFavorFileListOnePage(dir: IAliFileJson, token: ITokenInfo, onlydir: boolean) {
    const url = 'v2/file/list_by_custom_index_key';
    const postdata = {
      drive_id: dir.m_drive_id,
      marker: dir.next_marker,
      limit: AliFileList.LimitMax,
      url_expire_sec: 14000,
      image_thumbnail_process: 'image/resize,w_400/format,jpeg',
      image_url_process: 'image/resize,w_1920/format,jpeg',
      video_thumbnail_process: 'video/snapshot,t_106000,f_jpg,ar_auto,m_fast,w_400',
      fields: '*',
      order_by: 'updated_at',
      order_direction: 'DESC',
      custom_index_key: 'starred_yes',
      parent_file_id: 'root',
    };
    const resp = await AliHttp.Post(url, postdata, token);
    return AliFileList._FileListOnePage('favorlist', dir, onlydir, resp);
  }
  static favorLoading = false;
 
  static async ApiFavorFileList(drive_id: string, dir_id: string, dir_name: string, token: ITokenInfo): Promise<IAliFileJson> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    const dir: IAliFileJson = {
      items: [],
      next_marker: '',
      m_time: 0,
      m_user_id: token.user_id,
      m_drive_id: drive_id,
      m_dir_id: dir_id,
      m_dir_name: dir_name,
    };
    if (AliFileList.favorLoading) {
      dir.next_marker = 'loading';
      return dir;
    }
    AliFileList.favorLoading = true;
    do {
      const isget = await AliFileList.ApiFavorFileListOnePage(dir, token, false);
      if (isget != true) {
        break; 
      }
      if (dir.items.length >= 5000) dir.next_marker = ''; 
    } while (dir.next_marker != '');
    AliFileList.DeleteTemp('favorlist', dir.m_user_id, dir.m_drive_id, dir.m_dir_id);
    AliFileList.favorLoading = false;
    return dir;
  }

  static async ApiSearchFileListOnePage(dir: IAliFileJson, query: string, orderby: string, token: ITokenInfo, onlydir: boolean) {
    const url = 'adrive/v3/file/search';
    const postdata = {
      drive_id: dir.m_drive_id,
      marker: dir.next_marker,
      limit: 100, 
      url_expire_sec: 14000,
      image_thumbnail_process: 'image/resize,w_400/format,jpeg',
      image_url_process: 'image/resize,w_1920/format,jpeg',
      video_thumbnail_process: 'video/snapshot,t_106000,f_jpg,ar_auto,m_fast,w_400',
      fields: '*',
      query: query,
      order_by: orderby,
    };
    const resp = await AliHttp.Post(url, postdata, token);
    return AliFileList._FileListOnePage(query == 'type = "folder"' ? 'alldirlist' : 'searchlist', dir, onlydir, resp);
  }
 
  static async ApiSearchFileList(drive_id: string, dir_id: string, dir_name: string, query: string, orderby: string, token: ITokenInfo): Promise<IAliFileJson> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    const dir: IAliFileJson = {
      items: [],
      next_marker: '',
      m_time: 0,
      m_user_id: token.user_id,
      m_drive_id: drive_id,
      m_dir_id: dir_id,
      m_dir_name: dir_name,
    };
    do {
      const isget = await AliFileList.ApiSearchFileListOnePage(dir, query, orderby, token, false);
      if (isget != true) {
        break; 
      }
    } while (dir.next_marker != '');
    if (dir.next_marker == '') {
      if (window.electronworker) {
        window.WinMsgToMain({
          cmd: 'MainSaveFileListAllPage',
          from: query == 'type = "folder"' ? 'alldirlist' : 'searchlist',
          user_id: dir.m_user_id,
          drive_id: dir.m_drive_id,
          dir_id: dir.m_dir_id,
          items: dir.items,
        });
      } else if (query == 'type = "folder"') {
        await SQL.SaveAllDir(dir.m_user_id, dir.m_drive_id, dir.items);
      }
    }
    AliFileList.DeleteTemp(query == 'type = "folder"' ? 'alldirlist' : 'searchlist', dir.m_user_id, dir.m_drive_id, dir.m_dir_id);
    return dir;
  }

  static async ApiAllDirList(drive_id: string, dir_id: string, dir_name: string, token: ITokenInfo): Promise<IAliFileJson> {
    return AliFileList.ApiSearchFileList(drive_id, dir_id, dir_name, 'type = "folder"', 'created_at ASC', token);
  }

  static async ApiFileListTestLimit(token: ITokenInfo) {
    const url = 'adrive/v3/file/list';
    const postdata = {
      drive_id: token.default_drive_id,
      parent_file_id: 'root',
      marker: '',
      limit: 10000,
      all: false,
      url_expire_sec: 14000,
      image_thumbnail_process: 'image/resize,w_400/format,jpeg',
      image_url_process: 'image/resize,w_1920/format,jpeg',
      video_thumbnail_process: 'video/snapshot,t_106000,f_jpg,ar_auto,m_fast,w_400',
      fields: '*',
      order_by: 'name',
      order_direction: 'ASC',
    };
    const resp = await AliHttp.Post(url, postdata, token, false);
   
    const msg = (resp.body?.message as string | undefined) || '';
    if (msg.indexOf('limit should be less than 200')) {
      AliFileList.LimitMax = 200;
      if (window.WinMsgToUI) window.WinMsgToUI({ cmd: 'LimitMax', LimitMax: 200 });
    }
  }
}
