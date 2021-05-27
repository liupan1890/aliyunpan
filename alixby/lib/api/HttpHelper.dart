import 'dart:convert';
import 'dart:io';

class HttpHelper {
  HttpHelper();

  static Future<Map<String, dynamic>> postToServer(String action, String postdata) async {
    var data = jsonEncode({"url": action, "postdata": postdata});
    var bytes = utf8.encode(data);
    var data64 = base64Encode(bytes);
    var bytes64 = utf8.encode(data64);
    var url = 'http://localhost:29385/url';
    var httpClient = new HttpClient();

    try {
      var request = await httpClient.postUrl(Uri.parse(url));

      request.headers.add("x-md-by", "xiaobaiyang");
      request.add(bytes64);
      var response = await request.close();
      if (response.statusCode == HttpStatus.ok) {
        var json = await response.transform(utf8.decoder).join();
        var data = jsonDecode(json);
        return data['body'];
      } else {
        return jsonDecode("{\"code\":503,\"message\":\"error\"}");
      }
    } catch (exception) {
      return jsonDecode("{\"code\":503,\"message\":\"error\"}");
    }
  }
}
