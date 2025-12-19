
import React, { useEffect, useRef } from 'react'
export default function Particles(){ const ref = useRef()
  useEffect(()=>{
    const canvas = document.createElement('canvas');
    canvas.style.position='fixed'; canvas.style.left='0'; canvas.style.top='0'; canvas.style.pointerEvents='none'; canvas.style.zIndex='5';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth; let h = canvas.height = window.innerHeight;
    const particles = Array.from({length:40}).map(()=>({ x: Math.random()*w, y: Math.random()*h, r: Math.random()*3+1, vx: (Math.random()-0.5)*0.6, vy: (Math.random()-0.5)*0.6, hue: Math.random()*50+260 }));
    function resize(){ w=canvas.width=window.innerWidth; h=canvas.height=window.innerHeight }
    window.addEventListener('resize', resize);
    let raf;
    function draw(){
      ctx.clearRect(0,0,w,h);
      for(const p of particles){
        p.x += p.vx; p.y += p.vy;
        if(p.x<0) p.x=w; if(p.x>w) p.x=0; if(p.y<0) p.y=h; if(p.y>h) p.y=0;
        ctx.beginPath();
        const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*6);
        g.addColorStop(0, `hsla(${p.hue},80%,65%,0.9)`);
        g.addColorStop(1, `hsla(${p.hue},80%,65%,0.03)`);
        ctx.fillStyle = g;
        ctx.fillRect(p.x-p.r*6, p.y-p.r*6, p.r*12, p.r*12);
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize', resize); try{ document.body.removeChild(canvas) }catch(e){} }
  },[])
  return null
}
