export function PrismExt(file_ext: string) {
  const ext = '.' + file_ext.toLowerCase() + '.';
  let fext = file_ext.toLowerCase();
  let iscode = false;
  iscode = iscode || ';.markup.html.xml.svg.mathml.ssml.atom.rss.css.clike.javascript.js.abap.'.indexOf(ext) > 0;
  iscode = iscode || ';.actionscript.ada.agda.al.antlr4.g4.apacheconf.apex.apl.applescript.abnf.'.indexOf(ext) > 0;
  iscode = iscode || ';.aql.arduino.arff.asciidoc.adoc.aspnet.asm6502.autohotkey.autoit.bash.shell.'.indexOf(ext) > 0;
  iscode = iscode || ';.basic.batch.bbcode.shortcode.birb.bison.bnfrbnf.brainfuck.brightscript.'.indexOf(ext) > 0;
  iscode = iscode || ';.bro.bsl.oscript.c.csharp.cs.dotnet.cpp.cfscript.cfc.chaiscript.cil.clojure.cmake.'.indexOf(ext) > 0;
  iscode = iscode || ';.cobol.coffeescript.coffee.concurnas.conc.csp.coq.crystal.css-extras.csv.cypher.n4jsd.'.indexOf(ext) > 0;
  iscode = iscode || ';.d.dart.dataweave.dax.dhall.diff.django.jinja2.dns-zone-file.dns-zone..purs.purescript.'.indexOf(ext) > 0;
  iscode = iscode || ';.docker.dockerfile.dot.gv.ebnf.editorconfig.eiffel.ejs.eta.elixir.elm.etlua.erb.erlang.'.indexOf(ext) > 0;
  iscode = iscode || ';.fsharp.factor.false.firestore-security-rules.flow.fortran.ftl.gml.gamemakerlanguage.'.indexOf(ext) > 0;
  iscode = iscode || ';.gcode.gdscript.gedcom.gherkin.git.glsl.go.graphql.groovy.haml.handlebars.hbs.'.indexOf(ext) > 0;
  iscode = iscode || ';.haskell.hs.haxe.hcl.hlsl.hoon.http.hpkp.hsts.ichigojam.icon.icu-message-format.'.indexOf(ext) > 0;
  iscode = iscode || ';.idris.idr.ignore.gitignore.hgignore.npmignore.inform7.ini.io.j.java.javadoc.javadoclike.'.indexOf(ext) > 0;
  iscode = iscode || ';.javastacktrace.jexl.jolie.jq.jsdoc.js-extras.json.webmanifest.json5.jsonp.jsstacktrace.px.'.indexOf(ext) > 0;
  iscode = iscode || ';.js-templates.julia.keyman.kotlin.kt.kts.kumir.kum.latex.tex.context.latte.less.lilypond.ly.'.indexOf(ext) > 0;
  iscode = iscode || ';.liquid.lisp.emacs.elisp.emacs-lisp.livescript.llvm.log.lolcode.lua.makefile.markdown.md.'.indexOf(ext) > 0;
  iscode = iscode || ';.markup-templating.matlab.mel.mizar.mongodb.monkey.moonscript.moon.n1ql.n4js.'.indexOf(ext) > 0;
  iscode = iscode || ';.nand2tetris-hdl.naniscript.nani.nasm.neon.nevod.nginx.nim.nix.nsis.objectivec.objc.'.indexOf(ext) > 0;
  iscode = iscode || ';.ocaml.opencl.openqasm.qasm.oz.parigp.parser.pascal.objectpascal.pascaligo.psl.pcaxis.'.indexOf(ext) > 0;
  iscode = iscode || ';.peoplecode.pcode.perl.php.phpdoc.php-extras.plsql.powerquery.pq.mscript.powershell.'.indexOf(ext) > 0;
  iscode = iscode || ';.processing.prolog.promql.properties.protobuf.pug.puppet.pure.purebasic.pbfasm.twig.'.indexOf(ext) > 0;
  iscode = iscode || ';.python.py.qsharp.qs.q.qml.qore.r.racket.rkt.jsx.tsx.reason.regex.rego.renpy.rpy.rest.rip.'.indexOf(ext) > 0;
  iscode = iscode || ';.robotframework.robot.ruby.rb.rust.sas.sass.scss.scala.scheme.shell-session.sh-session.sql.'.indexOf(ext) > 0;
  iscode = iscode || ';.smali.smalltalk.smarty.sml.smlnj.solidity.sol.solution-file.sln.soy.sparql.rq.splunk-spl.sqf.'.indexOf(ext) > 0;
  iscode = iscode || ';.squirrel.stan.iecst.stylus.swift.t4-templating.t4-cs.t4.t4-vb.tap.tcl.tt2.textile.toml.turtle.trig.'.indexOf(ext) > 0;
  iscode = iscode || ';.typescript.ts.typoscript.tsconfig.unrealscript.uscript.uc.uri.url.v.vala.vbnet.velocity.verilog.'.indexOf(ext) > 0;
  iscode = iscode || ';.vim.visual-basic.vb.vba.warpscript.wasm.wiki.wolfram.mathematica.nb.wl.xeora.xeoracube.'.indexOf(ext) > 0;
  iscode = iscode || ';.xml-doc.xojo.xquery.yaml.yml.yang.zig.excel-formula.xlsx.xls.shellsession.roboconf.vhdl.'.indexOf(ext) > 0;

  if (iscode) {
    fext = file_ext;
  } else {
    //修正
    switch (fext) {
      case 'prettierrc':
        fext = 'json';
        break;
      case 'vue':
        fext = 'javascript';
      case 'h':
        fext = 'c';
        break;
      case 'as':
        fext = 'actionscript';
        break;
      case 'sh':
        fext = 'bash';
        break;
      case 'zsh':
        fext = 'bash';
        break;
      case 'bf':
        fext = 'brainfuck';
        break;
      case 'hpp':
        fext = 'cpp';
        break;
      case 'cc':
        fext = 'cpp';
        break;
      case 'hh':
        fext = 'cpp';
        break;
      case 'c++':
        fext = 'cpp';
        break;
      case 'h++':
        fext = 'cpp';
        break;
      case 'cxx':
        fext = 'cpp';
        break;
      case 'hxx':
        fext = 'cpp';
        break;
      case 'hxx':
        fext = 'cpp';
        break;
      case 'cson':
        fext = 'coffeescript';
        break;
      case 'iced':
        fext = 'coffeescript';
        break;
      case 'dns':
        fext = 'dns-zone';
        break;
      case 'zone':
        fext = 'dns-zone';
        break;
      case 'bind':
        fext = 'dns-zone';
        break;
      case 'plist':
        fext = 'xml';
        break;
      case 'xhtml':
        fext = 'html';
        break;
      case 'iml':
        fext = 'xml';
        break;
      case 'mk':
        fext = 'makefile';
        break;
      case 'mak':
        fext = 'makefile';
        break;
      case 'make':
        fext = 'makefile';
        break;
      case 'mkdown':
        fext = 'markdown';
        break;
      case 'mkd':
        fext = 'markdown';
        break;
      case 'nginxconf':
        fext = 'nginx';
        break;
      case 'nimrod':
        fext = 'nim';
        break;
      case 'mm':
        fext = 'objectivec';
        break;
      case 'obj-c':
        fext = 'objectivec';
        break;
      case 'obj-c++':
        fext = 'objectivec';
        break;
      case 'objective-c++':
        fext = 'objectivec';
        break;
      case 'ps':
        fext = 'powershell';
        break;
      case 'ps1':
        fext = 'powershell';
        break;
      case 'gyp':
        fext = 'python';
        break;
      case 'rs':
        fext = 'rust';
        break;
      case 'vb':
        fext = 'vbnet';
        break;
      case 'conf':
        fext = 'ini';
        break;
      default:
        fext = 'plain';
    }
  }
  return fext;
}
