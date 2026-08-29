const SVG_NS = 'http://www.w3.org/2000/svg';
const CSS_VARS = [
  '--ink', '--paper', '--panel', '--line', '--muted', '--accent',
  '--chart-grid', '--chart-axis', '--chart-label',
];

const dataUriCache = new Map<string, Promise<string>>();

function toDataUri(url: string): Promise<string> {
  let p = dataUriCache.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(`${r.status} ${url}`))))
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result as string);
            fr.onerror = () => reject(fr.error);
            fr.readAsDataURL(blob);
          }),
      );
    dataUriCache.set(url, p);
  }
  return p;
}

/** Serialize a live chart <svg> to a high-res PNG and trigger a download. */
export async function exportSvgToPng(svg: SVGSVGElement, filename: string, scale = 2): Promise<void> {
  const vb = svg.viewBox.baseVal;
  const w = vb.width || svg.clientWidth;
  const h = vb.height || svg.clientHeight;

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('width', String(w));
  clone.setAttribute('height', String(h));

  // inline every <image> as a data URI (SVG loaded as <img> can't fetch external refs)
  const images = Array.from(clone.querySelectorAll('image'));
  await Promise.all(
    images.map(async (img) => {
      const href = img.getAttribute('href') || img.getAttribute('xlink:href');
      if (!href) return;
      try {
        const abs = new URL(href, location.href).href;
        const uri = await toDataUri(abs);
        img.setAttribute('href', uri);
        img.removeAttribute('xlink:href');
      } catch {
        img.remove();
      }
    }),
  );

  // freeze current theme's CSS variables + a paper background
  const cs = getComputedStyle(document.documentElement);
  const style = document.createElementNS(SVG_NS, 'style');
  style.textContent =
    `:root{${CSS_VARS.map((v) => `${v}:${cs.getPropertyValue(v).trim()}`).join(';')}}` +
    `text{font-family:Inter,system-ui,sans-serif}`;
  clone.insertBefore(style, clone.firstChild);
  const bg = document.createElementNS(SVG_NS, 'rect');
  bg.setAttribute('x', '0');
  bg.setAttribute('y', '0');
  bg.setAttribute('width', String(w));
  bg.setAttribute('height', String(h));
  bg.setAttribute('fill', 'rgb(var(--paper))');
  clone.insertBefore(bg, style.nextSibling);

  const xml = new XMLSerializer().serializeToString(clone);
  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;

  const img = new Image();
  img.width = w;
  img.height = h;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('svg rasterize failed'));
    img.src = src;
  });

  const canvas = document.createElement('canvas');
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  await new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      }
      resolve();
    }, 'image/png');
  });
}
