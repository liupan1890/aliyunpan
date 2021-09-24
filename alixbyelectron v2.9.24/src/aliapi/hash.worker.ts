const worker = self as any;
const fspromises = global.require('fs/promises');
import { createSHA1, md5 } from 'hash-wasm';
let running = false;
worker.addEventListener('message', (event: any) => {
  if (event.data.hash && event.data.hash == 'sha1') {
    const localFilePath = event.data.localFilePath;
    const access_token = event.data.access_token;
    fileSha1(localFilePath, access_token);
  }
  if (event.data.stop) {
    running = false;
  }
});
worker.addEventListener('error', () => {
  worker.postMessage({ hash: 'sha1', sha1: 'error', proof_code: '' });
});

async function fileSha1(localFilePath: string, access_token: string) {
  running = true;
  let hash = '';
  const sha1 = await createSHA1();
  sha1.init();
  const filehandle = await fspromises.open(localFilePath, 'r');
  if (filehandle) {
    const stat = await filehandle.stat();
    const size = stat.size;
    const buff = Buffer.alloc(256 * 1024);
    let readlen = 0;
    while (true) {
      if (!running) break;
      const len = await filehandle.read(buff, 0, buff.length, null);
      if (len.bytesRead > 0 && len.bytesRead == buff.length) {
        sha1.update(buff);
      } else if (len.bytesRead > 0) {
        sha1.update(buff.slice(0, len.bytesRead));
      }
      readlen += len.bytesRead;
      const message = '计算sha1(' + Math.floor((readlen * 100) / size).toString() + '%)';
      worker.postMessage({ hash: 'sha1', readlen, size, message });
      if (len.bytesRead <= 0) break;
    }
    let proof_code = '';
    if (running) {
      hash = sha1.digest('hex');
      hash = hash.toUpperCase();
      const m = unescape(encodeURIComponent(access_token));
      const buffa = Buffer.from(m);
      const md5a = await md5(buffa);
      const start = Number(BigInt('0x' + md5a.substr(0, 16)) % BigInt(size));
      const end = Math.min(start + 8, size);
      const buffb = Buffer.alloc(end - start);
      await filehandle.read(buffb, 0, buffb.length, start);
      proof_code = buffb.toString('base64');
    } else {
      hash = 'error';
      proof_code = '';
    }
    await filehandle?.close();
    worker.postMessage({ hash: 'sha1', sha1: hash, proof_code });
    running = false;
    close();
  } else {
    worker.postMessage({ hash: 'sha1', sha1: 'error', proof_code: '' });
    running = false;
    close();
  }
}
