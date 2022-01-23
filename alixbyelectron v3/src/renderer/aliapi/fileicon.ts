export default function getFileIcon(category: string | undefined, ext: string | undefined, mimext: string | undefined, mime: string | undefined, size: number): string[] {
  if (!ext) ext = ''
  if (!mime) mime = ''
  if (!mimext) mimext = ''
  if (!category) category = 'others'


  ext = '.' + ext.toLowerCase().replace('.', '').trim() + '.'
  mimext = '.' + mimext.toLowerCase().replace('.', '').trim() + '.'

  switch (ext) {
    case '.txt.':
      return ['doc', 'iconfile-txt']
    case '.rar.':
      return ['zip', 'iconfile-rar']
    case '.rtf.':
      return ['doc', 'iconfile-doc']
    case '.psd.':
      return ['others', 'iconfile-psd']
    case '.torrent.':
      return ['others', 'iconfile-bt']
    case '.iso.':
      return ['others', 'iconfile-iso']
    case '.exe.':
      return ['others', 'iconfile-exe']
    case '.apk.':
      return ['others', 'iconfile-apk']
    case '.tar.':
      return ['others', 'iconfile-tar']
    case '.7z.':
      return ['others', 'iconfile-7z']
    case '.svg.':
      return ['image3', 'iconfile-image']
  }

  if (category == 'zip' || mimext == '.zip.') {
    return ['zip', 'iconfile-zip']
  }

  if (';.apng.avif.ico.webp.gif.'.indexOf(ext) > 0) {
    return ['image2', 'iconfile-img']
  }

  if (category == 'image') {
    return ['image', 'iconfile-img']
  }

  if (mime.startsWith('image/')) return ['image3', 'iconfile-image']
  if (ext == '.pdf.' || mimext == '.pdf.') return ['doc', 'iconfile-pdf']
  if (';.doc.docm.docx.dot.dotm.dotx.wps.wpt.'.indexOf(ext) > 0) return ['doc', 'iconfile-doc']
  if (';.pot.ett.'.indexOf(ext) > 0) return ['doc2', 'iconfile-doc']
  if ((mimext.startsWith('.txt') || mimext.startsWith('.doc') || mimext.startsWith('.ppt')) && ';.dps.dpt.potm.potx.pps.ppsm.ppsx.ppt.pptm.pptx.'.indexOf(ext) > 0) return ['doc', 'iconfile-ppt']
  if ((mimext.startsWith('.txt') || mimext.startsWith('.xls')) && ';.xls.xlsx.et.xlsm.xlt.xltm.xltx.'.indexOf(ext) > 0) return ['doc', 'iconfile-xsl']

  if (mime.startsWith('text/')) return ['others', 'iconfile_txt2']
  if (ext == '.json.') return ['others', 'iconfile_txt2']

  if (category == 'video') {
    return ['video', 'iconfile_video']
  }
  if (mime.startsWith('video/')) return ['video2', 'iconfile_video']
  if (ext == '.ts.' && size > 5 * 1024 * 1024) return ['video2', 'iconfile_video']
  if (';.3iv.cpk.divx.hdv.fli.f4v.f4p.m2t.m2ts.mts.trp.mkv.mp4.mpg4.nsv.nut.nuv.rm.rmvb.vob.wmv.mk3d.hevc.yuv.y4m.mov.avi.flv.mpg.3gp.m4v.mpeg.asf.wmz.webm.pmp.mpga'.indexOf(ext) > 0) {
    return ['video2', 'iconfile_video']
  }
  if (ext == '.mp3.' && category == 'audio') return ['audio', 'iconfile-mp3']
  if (category == 'audio' && mimext != '.unknown.') {
    return ['audio', 'iconfile-audio']
  }
  if (mime.startsWith('audio/')) return ['audio', 'iconfile-audio']
  if (';.ape.aac.cda.dsf.dtshd.eac3.m1a.m2a.m4a.mka.mpa.mpc.opus.ra.tak.tta.wma.wv.'.indexOf(ext) > 0) {
    return ['audio2', 'iconfile-audio']
  }

  return ['others', 'iconwenjian']
}
