(function(){
  'use strict';
  const colorMap = {
    putih:'#eee9df', oranye:'#c56631', cokelat:'#705143', biru:'#456f91', merah:'#9a4138',
    pink:'#c9849d', hitam:'#24211d', kuning:'#d1ae45', ungu:'#735e86', hijau:'#5d7c61', abu:'#8f8b82'
  };
  const prodCovers = 'https://risethumdigsasindo.github.io/Kartografi-Sampul-Sastra-Indonesia/covers/';
  const localCovers = '../assets/covers/';
  const fmt = (v,d=1) => Number(v).toLocaleString('id-ID',{minimumFractionDigits:d,maximumFractionDigits:d});
  const fmtInt = v => Number(v).toLocaleString('id-ID');
  const cleanFile = file => encodeURIComponent(file || '').replaceAll('%2F','/');
  const isLocalHost = ['localhost','127.0.0.1',''].includes(location.hostname);
  function coverUrl(file, production=!isLocalHost){ return (production ? prodCovers : localCovers) + cleanFile(file); }
  function setCoverFallback(img,file){
    if(!img || !file) return;
    img.src=coverUrl(file);
    img.onerror=()=>{
      if(img.dataset.remoteTried) return;
      img.dataset.remoteTried='1';
      img.src=coverUrl(file,true);
    };
  }
  async function loadSummary(){ const r=await fetch('../data/summary.json'); if(!r.ok) throw new Error('summary.json '+r.status); return r.json(); }
  async function loadBooks(){ const r=await fetch('../data/books.min.json'); if(!r.ok) throw new Error('books.min.json '+r.status); return r.json(); }

  function announceHeight(){
    if(window.parent===window) return;
    const send=()=>{
      const height=Math.max(
        document.documentElement.scrollHeight,
        document.body ? document.body.scrollHeight : 0
      );
      window.parent.postMessage({type:'kartografi:resize',height,href:location.href},'*');
    };
    let timer;
    const queue=()=>{ clearTimeout(timer); timer=setTimeout(send,40); };
    window.addEventListener('load',queue,{once:true});
    window.addEventListener('resize',queue,{passive:true});
    if('ResizeObserver' in window){
      const ro=new ResizeObserver(queue);
      ro.observe(document.documentElement);
      if(document.body) ro.observe(document.body);
    } else {
      setInterval(send,1200);
    }
    queue();
  }

  function makeLiveRegion(container, className='chart-selection'){
    let region=container.querySelector('.'+className);
    if(!region){
      region=document.createElement('div');
      region.className=className;
      region.setAttribute('role','status');
      region.setAttribute('aria-live','polite');
      region.innerHTML='<span>Pilih elemen visual untuk melihat nilainya.</span>';
      container.appendChild(region);
    }
    return region;
  }

  document.addEventListener('DOMContentLoaded',announceHeight,{once:true});
  window.KF = { colorMap, fmt, fmtInt, coverUrl, setCoverFallback, loadSummary, loadBooks, prodCovers, localCovers, announceHeight, makeLiveRegion };
})();
