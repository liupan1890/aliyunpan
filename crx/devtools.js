chrome.devtools.network.onRequestFinished.addListener(function (detail) {
  let url = detail.request.url;
  if (url.indexOf("api.aliyundrive.com") > 0) return;
  if (url.indexOf("_tmd_") > 0) return;
  if (url.indexOf(".aliyundrive.com") <= 0) return;
  if (detail.request.method != "POST") return;

  detail.getContent(function (content, mimeType) {
    try {
      if (typeof content == "string" && content.indexOf('"bizExt"') > 0) {
        const data = JSON.parse(content);
        const bizExt = data.content?.data?.bizExt || "";
        if (bizExt) {
          chrome.devtools.inspectedWindow.eval(
            "console.log('" + JSON.stringify({ bizExt: bizExt }) + "')"
          );
        }
      }
    } catch {}
  });
});
