/* ============================================================
   FitCalc — minimal dependency-free PDF generator
   A4 portrait, Helvetica / Helvetica-Bold (PDF core fonts,
   WinAnsi encoding), simple block layout with pagination.

   Block types:
     { style: "title"|"subtitle"|"section"|"kv"|"text"|"small",
       text: "...", value: "..." (kv only) }
     { rule: true }   — thin horizontal divider
     { gap: 8 }       — vertical space in pt

   API: window.FitCalcPdf.generate(blocks, filename)
   ============================================================ */

(function () {
  "use strict";

  var PAGE_W = 595.28, PAGE_H = 841.89; // A4 in pt
  var M = 50;                            // margin
  var CONTENT_W = PAGE_W - 2 * M;
  var VALUE_X = M + 240;                 // value column for kv rows

  var STYLES = {
    title:    { font: "F2", size: 20,   color: [0.07, 0.08, 0.10], lead: 28 },
    subtitle: { font: "F1", size: 9.5,  color: [0.45, 0.47, 0.52], lead: 14 },
    section:  { font: "F2", size: 12.5, color: [0.36, 0.50, 0.02], lead: 20, spaceBefore: 8 },
    kv:       { font: "F1", size: 10.5, color: [0.22, 0.24, 0.28], lead: 16, vfont: "F2" },
    text:     { font: "F1", size: 10.5, color: [0.22, 0.24, 0.28], lead: 15 },
    small:    { font: "F1", size: 8.5,  color: [0.50, 0.52, 0.56], lead: 12 },
  };

  /* --- WinAnsi encoding helpers --- */

  // Characters that exist in WinAnsi but not at their Unicode code point
  var WINANSI = {
    "\u2013": 0x96, "\u2014": 0x97, "\u2018": 0x91, "\u2019": 0x92,
    "\u201C": 0x93, "\u201D": 0x94, "\u2022": 0x95, "\u2026": 0x85,
  };

  // Characters NOT in WinAnsi — replaced with ASCII-ish equivalents
  var REPLACE = {
    "\u2212": "-",    // − minus
    "\u2248": "~",    // ≈
    "\u2192": "->",   // →
    "\u00B2": "2",    // ²
    "\u2264": "<=", "\u2265": ">=",
    "\u2714": "v", "\u2716": "x",
    "\u00D7": "x", "\u00F7": "/",
    "\u2B07": "v",
  };

  // Emoji (surrogate pairs) we use in the UI — dropped in PDF
  var DROP_PAIRS = { "\uD83C\uDF89": "", "\uD83D\uDCAA": "", "\uD83D\uDC4B": "", "\uD83D\uDCA7": "" };

  function sanitize(str) {
    var out = "";
    for (var i = 0; i < str.length; i++) {
      var code = str.charCodeAt(i);
      if (code >= 0xd800 && code <= 0xdbff) { // surrogate pair
        var pair = str.substr(i, 2);
        if (DROP_PAIRS.hasOwnProperty(pair)) out += DROP_PAIRS[pair];
        i++;
        continue;
      }
      var ch = str[i];
      if (REPLACE.hasOwnProperty(ch)) { out += REPLACE[ch]; continue; }
      if (WINANSI.hasOwnProperty(ch)) { out += ch; continue; }
      if (code < 256) { out += ch; continue; }
      // unknown non-Latin1 char — drop
    }
    return out;
  }

  function pdfString(str) {
    var s = sanitize(str);
    var out = "(";
    for (var i = 0; i < s.length; i++) {
      var ch = s[i];
      var b = WINANSI.hasOwnProperty(ch) ? WINANSI[ch] : s.charCodeAt(i) & 0xff;
      if (b === 0x28) out += "\\(";
      else if (b === 0x29) out += "\\)";
      else if (b === 0x5c) out += "\\\\";
      else out += String.fromCharCode(b);
    }
    return out + ")";
  }

  /* --- content stream ops --- */

  function n2(x) { return x.toFixed(2); }
  function colorOp(rgb) { return n2(rgb[0]) + " " + n2(rgb[1]) + " " + n2(rgb[2]) + " rg\n"; }
  function rectOp(x, y, w, h) { return n2(x) + " " + n2(y) + " " + n2(w) + " " + n2(h) + " re f\n"; }

  function textOp(font, size, color, x, y, str) {
    return colorOp(color) + "BT /" + font + " " + n2(size) +
      " Tf 1 0 0 1 " + n2(x) + " " + n2(y) + " Tm " + pdfString(str) + " Tj ET\n";
  }

  /* --- layout: blocks → pages of content-stream strings --- */

  function layout(blocks) {
    var pages = [];
    var cur = [];
    var y = PAGE_H - M;

    function next() {
      pages.push(cur.join(""));
      cur = [];
      y = PAGE_H - M;
    }

    blocks.forEach(function (b) {
      if (b.rule) {
        if (y - 14 < M) next();
        cur.push(colorOp([0.85, 0.87, 0.89]) + rectOp(M, y - 8, CONTENT_W, 0.8));
        y -= 14;
        return;
      }
      if (b.gap) { y -= b.gap; return; }

      var st = STYLES[b.style] || STYLES.text;
      var need = st.lead + (st.spaceBefore || 0);
      if (y - need < M) next();
      y -= (st.spaceBefore || 0);
      var baseline = y - st.size;

      if (b.style === "kv") {
        cur.push(textOp("F1", st.size, st.color, M, baseline, b.text));
        if (b.value != null) {
          cur.push(textOp(st.vfont || "F2", st.size, [0.08, 0.09, 0.11], VALUE_X, baseline, b.value));
        }
      } else {
        cur.push(textOp(st.font, st.size, st.color, M, baseline, b.text));
      }
      y -= st.lead;
    });

    pages.push(cur.join(""));
    return pages;
  }

  function footerOps(pageNum, total) {
    return textOp("F1", 8.5, [0.55, 0.57, 0.60], M, 32,
      "FitCalc — Personal Fitness Report  ·  page " + pageNum + " of " + total +
      "  ·  Developed by Tausif Rasool");
  }

  /* --- assemble the PDF file (binary string, 1 char = 1 byte) --- */

  function buildPdf(blocks) {
    var pages = layout(blocks);
    var n = pages.length;

    var out = "%PDF-1.4\n";
    var offsets = [];

    function writeObj(num, body) {
      offsets[num] = out.length;
      out += num + " 0 obj\n" + body + "\nendobj\n";
    }
    function writeStreamObj(num, streamStr) {
      offsets[num] = out.length;
      out += num + " 0 obj\n<< /Length " + streamStr.length + " >>\nstream\n" +
        streamStr + "\nendstream\nendobj\n";
    }

    var kids = [];
    for (var i = 0; i < n; i++) kids.push((5 + 2 * i) + " 0 R");

    writeObj(1, "<< /Type /Catalog /Pages 2 0 R >>");
    writeObj(2, "<< /Type /Pages /Kids [" + kids.join(" ") + "] /Count " + n + " >>");
    writeObj(3, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    writeObj(4, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");

    for (i = 0; i < n; i++) {
      var content = pages[i] + footerOps(i + 1, n);
      writeObj(5 + 2 * i,
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] " +
        "/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents " + (6 + 2 * i) + " 0 R >>");
      writeStreamObj(6 + 2 * i, content);
    }

    var count = 5 + 2 * n;
    var xrefPos = out.length;
    out += "xref\n0 " + count + "\n0000000000 65535 f \n";
    for (var k = 1; k < count; k++) {
      out += String(offsets[k]).padStart(10, "0") + " 00000 n \n";
    }
    out += "trailer\n<< /Size " + count + " /Root 1 0 R >>\nstartxref\n" + xrefPos + "\n%%EOF";

    var bytes = new Uint8Array(out.length);
    for (k = 0; k < out.length; k++) bytes[k] = out.charCodeAt(k) & 0xff;
    return bytes;
  }

  /* --- public API --- */

  var lastBytes = null;

  function generate(blocks, filename) {
    var bytes = buildPdf(blocks);
    lastBytes = bytes;

    if (typeof URL === "undefined" || !URL.createObjectURL) {
      throw new Error("Blob downloads unsupported in this environment");
    }
    var blob = new Blob([bytes], { type: "application/pdf" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename || "fitcalc-report.pdf";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 800);

    return bytes.length;
  }

  window.FitCalcPdf = {
    generate: generate,
    get _lastBytes() { return lastBytes; },
  };
})();
