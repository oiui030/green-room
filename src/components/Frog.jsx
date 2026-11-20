// The illustration is square; this crops it to the frog's face.
// `ring` wraps it in a sticker edge: pale by default, lime for the floating helper.
export default function Frog({ size = 56, ring = 0, tone = '', shape = '' }) {
  const inner = size - ring * 2;
  const img = (1024 * inner) / 150;
  const face = (
    <span className="frog" style={{ width: inner, height: inner }}>
      <img src="./img/frog.webp" alt="개구리" style={{ width: img, height: img, left: inner / 2 - (500 * inner) / 150, top: inner / 2 - (630 * inner) / 150 }} />
    </span>
  );
  if (!ring) return face;
  return <span className={`sticker ${tone} ${shape}`} style={{ padding: ring }}>{face}</span>;
}
