/* Birgitta, the job-centre clerk who gives advice in the park. 16 × 16 pixel portrait. */

const ROWS = [
  '......HHHH......',
  '.....HHHHHH.....',
  '....hHHHHHHh....',
  '...HHHHHHHHHH...',
  '..HHHSSSSSSHHH..',
  '..HHSSSSSSSSHH..',
  '..HSKKKSSKKKSH..',
  '..HSKGKKKKGKSH..',
  '..HSKKKSSKKKSH..',
  '..hSSSSssSSSSh..',
  '...SRSSSSSSRS...',
  '...SSSMMMMSSS...',
  '....SSSSSSSS....',
  '...CCWCWWCWCC...',
  '..CCCCCCCCCCCC..',
  '.CCccCCCCCCccCC.',
]

const COLORS: Record<string, string> = {
  H: '#C3C3D3',
  h: '#8E8EA0',
  S: '#F2C29B',
  s: '#D9A07A',
  K: '#1A1A2E',
  G: '#8FE3FF',
  R: '#F07B9A',
  M: '#A0423A',
  C: '#E04848',
  c: '#A62F3A',
  W: '#FFFFFF',
}

export default function Birgitta() {
  return (
    <svg className="portrait" viewBox="0 0 16 16" shapeRendering="crispEdges" role="img" aria-label="Birgitta">
      <rect width="16" height="16" fill="#5B8FD9" />
      {ROWS.flatMap((row, y) =>
        [...row].map((ch, x) => (ch === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={COLORS[ch]} />)),
      )}
    </svg>
  )
}
