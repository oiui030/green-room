// The illustration is square; this crops it to the frog's face.
export default function Frog({ size = 56 }) {
  const img = (1024 * size) / 150;
  return (
    <span className="frog" style={{ width: size, height: size }}>
      <img src="./img/frog.webp" alt="개구리" style={{ width: img, height: img, left: size / 2 - (500 * size) / 150, top: size / 2 - (630 * size) / 150 }} />
    </span>
  );
}
