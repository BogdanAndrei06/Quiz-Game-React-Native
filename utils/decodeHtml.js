// utils/decodeHtml.js
export function decodeHtml(html) {
  if (!html) return "";

  let text = html
 //   .replace(/&quot;/g, '"')
 //   .replace(/&#039;/g, "'")
 //   .replace(/&apos;/g, "'")
 //   .replace(/&amp;/g, "&")
 //   .replace(/&lt;/g, "<")
 //   .replace(/&gt;/g, ">")
 //   .replace(/&ldquo;|&rdquo;/g, '"')
   // .replace(/&lsquo;|&rsquo;/g, "'")
   // .replace(/&eacute;/g, "é");

  // numeric entities: &#123;
  text = text.replace(/&#(\d+);/g, (_, dec) => {
    const code = parseInt(dec, 10);
    if (Number.isNaN(code)) return _;
    return String.fromCharCode(code);
  });

  return text;
}
