import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler(req) {
  const { searchParams } = new URL(req.url);
  const piecesParam = searchParams.get('pieces');
  const pieces = piecesParam ? piecesParam.split(',').filter(Boolean) : [];

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', 
        backgroundColor: '#050505', padding: '30px', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '10px', width: '100%', height: '100%'
        }}>
          {[...Array(12)].map((_, i) => {
            const num = String(i + 1);
            const isOwned = pieces.includes(num);
            return (
              <div key={i} style={{
                background: isOwned ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                border: '1px solid ' + (isOwned ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.08)'),
                borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isOwned ? '#ffffff' : '#333333', 
                fontSize: '22px', fontWeight: 'bold', fontFamily: 'sans-serif'
              }}>
                {isOwned ? `PIECE ${num}` : (num.padStart(2, '0'))}
              </div>
            );
          })}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}