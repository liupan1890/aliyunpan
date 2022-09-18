chrome.devtools.network.onRequestFinished.addListener(function (detail) {
  let url = detail.request.url;

  let isbreak = false;
  if (url.indexOf("api.aliyundrive.com") > 0) isbreak = true; /** 跳过api */
  if (url.indexOf("img.aliyundrive.com") > 0) isbreak = true; /** 跳过img */
  if (url.indexOf("_tmd_") > 0) isbreak = true; /** 跳过滑动验证 */
  if (url.indexOf(".aliyuncs.com") > 0) isbreak = true; /** 跳过滑动验证 */
  if (url.indexOf(".aliyun.com") > 0) isbreak = true; /** 跳过滑动验证 */
  if (url.indexOf(".taobao.com") > 0) isbreak = true; /** 跳过滑动验证 */
  if (url.indexOf(".mmstat.com") > 0) isbreak = true; /** 跳过日志 */

  if (url.indexOf(".aliyundrive.com") < 0) isbreak = true; /** 跳过无效域名 */
  if (isbreak) return;

  detail.getContent(function (content, mimeType) {
    try {
      if (typeof content == "string" && content.indexOf('"bizExt"') > 0) {
        let bizExt = "";
        try {
          /** https://passport.aliyundrive.com/newlogin/login.do?appName=aliyun_drive&fromSite=52&_bx-v=2.0.31 */
          const data = JSON.parse(content);
          bizExt = data.content?.data?.bizExt || "";
        } catch (e) {
          bizExt = "";
          chrome.devtools.inspectedWindow.eval(
            "console.log('" + JSON.stringify({ url, e, content }) + "')"
          );
        }

        if (!bizExt) {
          /** https://passport.aliyundrive.com/newlogin/safe/ivCheckLogin.htm?havana_iv_token=... 二次短信验证 */
          try {
            let temp = content.substring(
              content.indexOf('"bizExt"') + '"bizExt"'.length
            );
            temp = temp.substring(temp.indexOf('"') + 1); // :"eyJ...",
            temp = temp.substring(0, temp.indexOf('"')); //eyJ...

            if (temp.startsWith("eyJ")) bizExt = temp;
          } catch (e) {
            bizExt = "";
            chrome.devtools.inspectedWindow.eval(
              "console.log('" + JSON.stringify({ url, e, content }) + "')"
            );
          }
        }

        if (bizExt) {
          chrome.devtools.inspectedWindow.eval(
            "console.log('" + JSON.stringify({ bizExt: bizExt }) + "')"
          );
        }
      }
    } catch {}
  });
});
