// src/pages/ScienceDrill.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '../state/LangContext';
import Particles from '../components/Particles'; // <-- adjust path if needed

export default function ScienceDrill(){
  const { difficulty, grade } = useParams();
  const nav = useNavigate();
  const { t, lang = 'EN' } = useLang();

  // subjects for this drill page (science branches)
  const branches = [
    { key: 'physics', en: 'Physics', ta: 'பௌதிகவியல்', color: ['#7C3AED','#4F46E5'], icon: '🧭' },
    { key: 'chemistry', en: 'Chemistry', ta: 'ரசாயனம்', color: ['#F97316','#FB7185'], icon: '⚗️' },
    { key: 'biology', en: 'Biology', ta: 'உயிரியல்', color: ['#06B6D4','#0891B2'], icon: '🧬' }
  ];

  const labelFor = (item) => ( (lang === 'TA' || lang === 'ta') ? (item.ta || item.en) : item.en );

  const handleGoto = (key) => {
    nav(`/level/${difficulty}/${grade}/${key}`);
  }

  return (
    <div style={{ minHeight: '100vh', position:'relative', display:'flex', flexDirection:'column' }}>
      {/* Background animation (behind content) */}
      <div style={{ position:'absolute', inset:0, zIndex:0 }}>
        <Particles />
      </div>

      {/* Top spacing/header */}
      <div style={{ position:'relative', zIndex:10, padding: '28px 40px 0 40px' }}>
      
      </div>

      {/* Foreground content card area */}
      <div style={{
        position:'relative',
        zIndex:10,
        margin: '28px 40px',
        padding: '28px',
        borderRadius:18,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))',
        boxShadow:'0 30px 80px rgba(0,0,0,0.6)'
      }}>
        <h2 style={{ color:'#fff', fontSize:32, marginBottom:18, fontWeight:800 }}>
          { t.selectSubject }{ ' ' }(Grade {grade})
        </h2>

        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {branches.map(b => (
            <div
              key={b.key}
              onClick={() => handleGoto(b.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if(e.key === 'Enter') handleGoto(b.key) }}
              style={{
                display:'flex',
                alignItems:'center',
                justifyContent:'space-between',
                padding:'28px 22px',
                borderRadius:14,
                cursor:'pointer',
                userSelect:'none',
                // gradient background per item
                background: `linear-gradient(90deg, ${b.color[0]}, ${b.color[1]})`,
                boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
                color:'#fff',
              }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:18 }}>
                {/* icon tile */}
                <div style={{
                  width:64,
                  height:64,
                  borderRadius:12,
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  background: 'rgba(255,255,255,0.08)',
                  boxShadow:'inset 0 6px 12px rgba(255,255,255,0.06)'
                }}>
                  <span style={{ fontSize:28 }}>{b.icon}</span>
                </div>

                {/* labels */}
                <div>
                  <div style={{ fontSize:20, fontWeight:800 }}>{ labelFor(b) }</div>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,0.85)', marginTop:6 }}>
                    {/* small subtitle — keep empty or show difficulty */}
                    { difficulty } • { grade }
                  </div>
                </div>
              </div>

              {/* chevron arrow */}
              <div style={{ fontSize:20, opacity:0.9 }}>&#8250;</div>
            </div>
          ))}
        </div>
      </div>

      {/* bottom spacer */}
      <div style={{ height:120, zIndex:10 }} />
    </div>
  );
}
