
import React, { useEffect } from 'react'
export default function Confetti({trigger}){
  useEffect(()=>{
    let canvas = document.createElement('canvas'); canvas.style.position='fixed'; canvas.style.left=0; canvas.style.top=0; canvas.style.pointerEvents='none'; canvas.style.zIndex=9999;
    document.body.appendChild(canvas); const ctx = canvas.getContext('2d'); let w=canvas.width=window.innerWidth, h=canvas.height=window.innerHeight;
    window.addEventListener('resize', ()=>{ w=canvas.width=window.innerWidth; h=canvas.height=window.innerHeight });
    let pieces=[]; let raf;
    function burst(){
      pieces = Array.from({length:80}).map(()=>({ x: w/2, y: h/4, vx: (Math.random()-0.5)*10, vy: Math.random()*-8-2, r: Math.random()*6+4, color: `hsl(${Math.random()*360},80%,60%)`, rot: Math.random()*6 }));
      const g = performance.now();
      function anim(){
        ctx.clearRect(0,0,w,h);
        for(const p of pieces){
          p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.rot += 0.1;
          ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
          ctx.fillStyle = p.color; ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r);
          ctx.restore();
        }
        pieces = pieces.filter(p=> p.y < h+50);
        if(pieces.length>0) raf = requestAnimationFrame(anim);
      }
      anim();
    }
    function handler(e){
      if(e && e.detail === 'burst') burst();
    }
    window.addEventListener('confetti', handler);
    return ()=>{ window.removeEventListener('confetti', handler); try{ document.body.removeChild(canvas) }catch(e){} }
  },[])
  return null
}
