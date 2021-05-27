class FileIcons {
  FileIcons();

  static String getFileIconByPath(filepath) {
    if (filepath.indexOf('.') >= 0) {
      return getFileIcon(filepath.substr(filepath.lastIndexOf('.')), '');
    } else
      return 'file_file';
  }

  static String getFileIcon(String ext, String mime) {
    if (ext[0] != '.') ext = '.' + ext;
    if (ext == '.exe') return 'file_exe';
    if (ext == '.torrent') return 'file_bt';
    if (';.c.cpp.java.htm.html.css.js.vue.php.aspx.shtml.asp.jsp.json.url'.indexOf(ext) > 0) return 'file_html';
    //txt
    if (ext == '.txt' || ext == '.md' || ext == '.markdown' || ext == '.xml') return 'file_txt';
    if (';.md5.ini.nfo.info.config.cfg.bat.sh.cmd.log.debug.go'.indexOf(ext) > 0) return 'file_txt';
    //pdf word excel wps
    if (ext == '.pdf') return 'file_pdf';
    if (';.ppt.pptx.pot.potx.pps.dps.dpt'.indexOf(ext) > 0) return 'file_ppt';
    if (';.xls.xlt.xlsx.xltx.et.ett'.indexOf(ext) > 0) return 'file_xsl';
    if (';.doc.docx.dot.dotx.wps.wpt.rtf.uof.uos'.indexOf(ext) > 0) return 'file_doc';
    var ddd = "";
    ddd = _isZiMu(ext);
    if (ddd != '') return ddd; //字幕
    ddd = _isZip(ext, mime);
    if (ddd != '') return ddd; //压缩包
    ddd = _isDisk(ext);
    if (ddd != '') return ddd; //映像
    ddd = _isVideo(ext, mime);
    if (ddd != '') return ddd; //视频
    ddd = _isAudio(ext, mime);
    if (ddd != '') return ddd; //音乐
    ddd = _isImage(ext, mime);
    if (ddd != '') return ddd; //图片
    return 'file_file'; //最终找不到
  }

  static String _isZiMu(String ext) {
    var fileicon = '';
    if (ext == '.ssa')
      fileicon = 'file_ssa';
    else if (ext == '.ass')
      fileicon = 'file_ass';
    else if (ext == '.srt')
      fileicon = 'file_srt';
    else if (ext == '.stl')
      fileicon = 'file_stl';
    else if (ext == '.scc') fileicon = 'file_scc';
    return fileicon;
  }

  static String _isZip(String ext, String mime) {
    var fileicon = '';
    if (ext == '.7z' || ext == '.7zip' || ext == '.7-zip')
      fileicon = 'file_7z';
    else if (ext == '.zip')
      fileicon = 'file_zip';
    else if (ext == '.rar' || ext.startsWith('.part'))
      fileicon = 'file_rar';
    else if (ext == '.tar')
      fileicon = 'file_tar';
    else if (ext.startsWith('.z0') ||
        ext.startsWith('.z1') ||
        ext.startsWith('.z2') ||
        ext.startsWith('.z3') ||
        ext.startsWith('.z4') ||
        ext.startsWith('.z5') ||
        ext.startsWith('.z6') ||
        ext.startsWith('.z7') ||
        ext.startsWith('.z8') ||
        ext.startsWith('.z9'))
      fileicon = 'file_zip';
    else if (';.bz2.bzip2.cab.lzma.gz.gzip.tgz.taz.xar.arj.lzh.ace.uue.bz2.jar'.indexOf(ext) > 0 ||
        ext.startsWith('.0') ||
        ext.startsWith('.1') ||
        ext.startsWith('.2') ||
        ext.startsWith('.3'))
      fileicon = 'file_zip';
    else if (mime.startsWith('zip')) fileicon = 'file_zip';

    return fileicon;
  }

  static String _isDisk(String ext) {
    var fileicon = '';
    if (ext == '.vmdk')
      fileicon = 'file_vmdk';
    else if (ext == '.img')
      fileicon = 'file_img2';
    else if (ext == '.nsp')
      fileicon = 'file_nsp';
    else if (ext == '.xci')
      fileicon = 'file_xci';
    else if (ext == '.bin')
      fileicon = 'file_bin';
    else if (ext == '.dmg')
      fileicon = 'file_dmg';
    else if (ext == '.vhd')
      fileicon = 'file_vhd';
    else if (ext == '.mds')
      fileicon = 'file_mds';
    else if (ext == '.iso')
      fileicon = 'file_iso';
    else if (ext == '.gho')
      fileicon = 'file_gho';
    else if (ext == '.god') fileicon = 'file_god';
    return fileicon;
  }

  static String _isImage(String ext, String mime) {
    var fileicon = '';
    if (ext == '.bmp')
      fileicon = 'file_bmp';
    else if (ext == '.jpg' || ext == '.jpeg' || ext == '.jp2' || ext == '.jpeg2000')
      fileicon = 'file_jpg';
    else if (ext == '.png')
      fileicon = 'file_png';
    else if (ext == '.gif')
      fileicon = 'file_gif';
    else if (ext == '.svg')
      fileicon = 'file_svg';
    else if (ext == '.psd')
      fileicon = 'file_psd';
    else if (ext == '.ai')
      fileicon = 'file_ai';
    else if (ext == '.tif' || ext == '.tiff')
      fileicon = 'file_tif';
    else if (ext == '.eps')
      fileicon = 'file_eps';
    else if (ext == '.psd')
      fileicon = 'file_psd';
    else if (';.webp.pcx.tga.exif.fpx.cdr.pcd.dxf.ufo.raw.ico.hdri.wmf'.indexOf(ext) > 0)
      fileicon = 'file_image';
    else if (mime.startsWith('image')) fileicon = 'file_image';
    return fileicon;
  }

  static String _isVideo(String ext, String mime) {
    var fileicon = '';
    if (ext == '.avi' || ext == '.avi1')
      fileicon = 'file_avi';
    else if (ext == '.flv' || ext == '.flv1' || ext == '.f4v')
      fileicon = 'file_flv';
    else if (ext == '.mkv' || ext == '.mkv1')
      fileicon = 'file_mkv';
    else if (ext == '.mp4' || ext == '.mp41' || ext == '.m4v')
      fileicon = 'file_mp4';
    else if (ext == '.mov')
      fileicon = 'file_mov';
    else if (ext == '.swf')
      fileicon = 'file_swf';
    else if (ext == '.asf')
      fileicon = 'file_asf';
    else if (ext == '.wmv' || ext == '.wmv1')
      fileicon = 'file_wmv';
    else if (ext == '.ts' || ext == '.ts1' || ext == '.m2ts' || ext == '.mts')
      fileicon = 'file_ts';
    else if (ext == '.rmvb' || ext == '.rm')
      fileicon = 'file_rmvb';
    else if (';.m2t.m2v.mp2v.mpe.mpeg.mpg.mpv2.3g2.3gp.3gp2.3gpp.amr.amv.divx.dpg.dvr-ms.evo.ifo.k3g.m1v.m4b.m4p.mxf.nsr.nsv.ogm.ogv.qt.ram.rpm.skm.tp.tpr.trp.vob.webm.wm.wmo.wtv'
            .indexOf(ext) >
        0)
      fileicon = 'file_video';
    else if (mime.startsWith('video')) fileicon = 'file_video';

    return fileicon;
  }

  static String _isAudio(String ext, String mime) {
    var fileicon = '';
    if (ext == '.mp3')
      fileicon = 'file_mp3';
    else if (ext == '.flac')
      fileicon = 'file_flac';
    else if (ext == '.wav')
      fileicon = 'file_wav';
    else if (ext == '.cue')
      fileicon = 'file_cue';
    else if (ext == '.ogg')
      fileicon = 'file_ogg';
    else if (ext == '.ape')
      fileicon = 'file_ape';
    else if (';.aac.ac3.aiff.cda.dsf.dts.dtshd.eac3.m1a.m2a.m4a.mka.mod.mp2.mpa.mpc.ogg.opus.ra.tak.tta.wma.wv'
            .indexOf(ext) >
        0)
      fileicon = 'file_audio';
    else if (mime.startsWith('audio')) fileicon = 'file_audio';
    return fileicon;
  }
}
