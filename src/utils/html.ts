import { load } from 'cheerio';

export function injectOpenPixel(html: string, pixelUrl: string) {
  const $ = load(html);
  $('body').append(`<img src="${pixelUrl}" alt="" width="1" height="1" style="display:none" />`);
  return $.html();
}

export function rewriteLinksForClicks(html: string, wrapFn: (href: string) => string) {
  const $ = load(html);
  $('a[href]').each((_i, a) => {
    const href = $(a).attr('href')!;
    $(a).attr('href', wrapFn(href));
  });
  return $.html();
}
