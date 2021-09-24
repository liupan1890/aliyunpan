import protobuf from 'protobufjs';
const proto =
  'syntax="proto3";\
package panfilepackage;\
message PanFileInfo {\
  string domainid = 1;\
  string filetype = 2;\
  string status = 3;\
  string crc64 = 4;\
  string url = 5;\
  string downloadurl = 6;\
  bool isimage = 7;\
  bool isvideo = 8;\
  bool isvideopreview = 9;\
  bool isaudio = 10;\
  bool isWeiFa = 11;\
}';
const ProtoRoot = protobuf.parse(proto).root;
export const ProtoPanFileInfo = ProtoRoot.lookupType('panfilepackage.PanFileInfo');
