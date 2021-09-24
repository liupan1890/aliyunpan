
const { ipcRenderer } = require('electron');
process.noAsar = true;
window.electronworker = false;
window.platform = process.platform;
window.winmain = 1;
window.winworkui = 2;
window.electron = require('electron');
ipcRenderer.on('winid', function (event, arg) {
  window.winmain = arg.main;
  window.winworkui = arg.workui;
});
ipcRenderer.on('winmsg', function (event, arg) {
  if (window.WinMsg) window.WinMsg(JSON.parse(arg));
});
window.WinMsgToMain = function (data) {
 
  if (window.winmain) ipcRenderer.sendTo(window.winmain, 'winmsg', JSON.stringify(data));
};
window.WinMsgToUI = function (data) {
  if (window.winworkui) ipcRenderer.sendTo(window.winworkui, 'winmsg', JSON.stringify(data));
};

window.WebToElectron = function (data) {
  ipcRenderer.send('WebToElectron', data);
};

window.WebToElectronCB = function (data, callback) {
  const backdata = ipcRenderer.sendSync('WebToElectronCB', data);
  callback(backdata); 
};

ipcRenderer.on('ElectronToWeb', function (event, arg) {
  //console.log('ElectronToWeb', event, arg); // prints "pong"
});

window.WebSpawnSync = function (data, callback) {
  const backdata = ipcRenderer.sendSync('WebSpawnSync', data); 
  callback(backdata); 
};
window.WebShowOpenDialogSync = function (config, callback) {
  const backdata = ipcRenderer.sendSync('WebShowOpenDialogSync', config);
  callback(backdata); 
};

window.WebShowSaveDialogSync = function (config, callback) {
  const backdata = ipcRenderer.sendSync('WebShowSaveDialogSync', config);
  callback(backdata); 
};
window.WebShowItemInFolder = function (fullpath) {
  ipcRenderer.send('WebShowItemInFolder', fullpath);
};

window.WebPlatformSync = function (callback) {
  const backdata = ipcRenderer.sendSync('WebPlatformSync');
  callback(backdata); 
};

window.WebClearCookies = function () {
  ipcRenderer.send('WebClearCookies');
};
window.WebSetCookies = function (cookies) {
  ipcRenderer.send('WebSetCookies', cookies); 
};
window.WebFileHash = function (inputfile, hash, callback) {
  ipcRenderer.invoke('WebFileHash', { inputfile, hash }).then((result) => {
    callback(result);
  });
};

function createRightMenu() {
  window.addEventListener(
    'contextmenu',
    (e) => {
      e.preventDefault();
      if (isEleEditable(e.target)) {
        ipcRenderer.send('WebToElectron', { cmd: 'menuedit' });
      } else {
        let selectText = window.getSelection().toString();
        if (!!selectText) ipcRenderer.send('WebToElectron', { cmd: 'menucopy' });
      }
    },
    false
  );
}

function isEleEditable(e) {
  if (!e) {
    return false;
  }
  if ((e.tagName === 'INPUT' && e.type !== 'checkbox') || e.tagName === 'TEXTAREA' || e.contentEditable == 'true') {
    return true;
  } else {
    return isEleEditable(e.parentNode);
  }
}

createRightMenu();
