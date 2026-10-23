import {CONFIG} from './config.js';
import {clamp} from './math.js';
const PRICE_FMT=new Intl.NumberFormat('ru-RU');
const fmtPrice=n=>`${PRICE_FMT.format(n)} ₽`;
let onAddToCart=()=>{};
export function setAddToCartHandler(fn){onAddToCart=fn;}
const CAMERA=`<svg viewBox="0 0 48 48" aria-hidden="true" fill="none"><rect x="6" y="13" width="36" height="27" rx="3" stroke="currentColor" stroke-width="1.5"/><path d="M18 13 21 8h10l3 5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="24" cy="26" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M9 20h5" stroke="currentColor" stroke-width="1.5"/></svg>`;
export function initCarousel(){
 const track=document.getElementById('merchTrack'),dots=document.getElementById('carouselDots');
 const totalLabel=document.getElementById('carouselTotal');if(totalLabel)totalLabel.textContent=String(CONFIG.MERCH.length);
 const prev=document.getElementById('carouselPrev'),next=document.getElementById('carouselNext'),count=document.getElementById('carouselCount');
 const cards=CONFIG.MERCH.map((item,i)=>{
   const card=document.createElement('article');card.className='merch-card reveal';card.setAttribute('aria-label',`${i+1} из ${CONFIG.MERCH.length}: ${item.title}`);
   const visual=document.createElement('div');visual.className='merch-visual';
   const placeholder=document.createElement('div');placeholder.className='placeholder';placeholder.innerHTML=CAMERA+'<span>ФОТО СКОРО</span>';
   visual.append(placeholder);
    if(item.image){const img=document.createElement('img');img.className='merch-photo';img.alt=`${item.title} — мерч Квадратного напарника`;img.decoding='async';img.src=item.image;
      img.addEventListener('load',()=>{placeholder.remove();img.classList.add('is-loaded');});
      img.addEventListener('error',()=>{img.remove();console.warn(`Фото ${item.title} недоступно: ${item.image}`);});
      visual.append(img);}
   const label=document.createElement('div');label.className='placeholder-index';label.textContent=String(i+1).padStart(2,'0');visual.append(label);
   const badge=document.createElement('div');badge.className='placeholder-badge';badge.textContent='RED SQUARE';visual.append(badge);
    const caption=document.createElement('div');caption.className='card-caption';const h=document.createElement('h3');h.textContent=item.title;const small=document.createElement('small');small.textContent='0'+(i+1);caption.append(h,small);
    const buy=document.createElement('div');buy.className='card-buy';
    const price=document.createElement('span');price.className='card-price';price.textContent=fmtPrice(item.price);
    const btn=document.createElement('button');btn.type='button';btn.className='to-cart-btn';btn.textContent='В корзину';
    btn.setAttribute('aria-label',`Добавить в корзину: ${item.title}`);
    btn.addEventListener('click',()=>onAddToCart(item.id,btn));
    buy.append(price,btn);card.append(visual,caption,buy);track.append(card);return card;
 });
 const dotButtons=cards.map((item,i)=>{const b=document.createElement('button');b.type='button';b.className='dot-btn';b.setAttribute('aria-label',`Перейти к карточке «${CONFIG.MERCH[i].title}»`);b.addEventListener('click',()=>scrollToIndex(i));dots.append(b);return b;});
 let current=0,drag=null,suppressClick=false,scrollTimeout=0;
 const getStep=()=>cards.length>1?cards[1].offsetLeft-cards[0].offsetLeft:cards[0].offsetWidth;
 const max=()=>Math.max(0,track.scrollWidth-track.clientWidth);
 const go=(x,smooth=true)=>track.scrollTo({left:clamp(x,0,max()),behavior:smooth&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches?'smooth':'instant'});
 function scrollToIndex(i){i=clamp(i,0,cards.length-1);current=i;syncUI();go(cards[i].offsetLeft-cards[0].offsetLeft,true);}
 function syncUI(){const start=Math.max(0,track.scrollLeft),end=max();let idx=Math.round(start/Math.max(1,getStep()));if(end>20&&end-start<8)idx=cards.length-1;current=clamp(idx,0,cards.length-1);count.textContent=String(current+1).padStart(2,'0');prev.disabled=start<6;next.disabled=end-start<6;dotButtons.forEach((b,i)=>{b.classList.toggle('active',i===current);b.setAttribute('aria-current',i===current?'true':'false');});}
 function onScroll(){cancelAnimationFrame(scrollTimeout);scrollTimeout=requestAnimationFrame(syncUI);}track.addEventListener('scroll',onScroll,{passive:true});
 prev.addEventListener('click',()=>{go(track.scrollLeft-getStep(),true);});next.addEventListener('click',()=>{go(track.scrollLeft+getStep(),true);});
 // Only intercept genuine horizontal trackpad motion or shift+wheel; vertical scrolling always remains possible.
 track.addEventListener('wheel',event=>{const horizontal=Math.abs(event.deltaX)>Math.abs(event.deltaY)*1.15;
  if(horizontal||event.shiftKey){const d=horizontal?event.deltaX:event.deltaY;if((d<0&&track.scrollLeft>0)||(d>0&&track.scrollLeft<max()-1)){event.preventDefault();track.scrollLeft+=d;}}},{passive:false});
 track.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();go(track.scrollLeft+getStep(),true);}if(event.key==='ArrowLeft'){event.preventDefault();go(track.scrollLeft-getStep(),true);}if(event.key==='Home'){event.preventDefault();go(0,true);}if(event.key==='End'){event.preventDefault();go(max(),true);}});
  track.addEventListener('pointerdown',event=>{if((event.pointerType!=='mouse'&&event.pointerType!=='pen')||event.button!==0)return;
   if(event.target.closest('button'))return; // не мешаем кликам по кнопкам карточек
   drag={x:event.clientX,left:track.scrollLeft,moved:false};suppressClick=false;}); // захват указателя — только при начале движения, чтобы не глотать клики
  track.addEventListener('pointermove',event=>{if(!drag)return;const dx=event.clientX-drag.x;drag.dx=dx;if(Math.abs(dx)>4){if(!drag.moved){drag.moved=true;try{track.setPointerCapture(event.pointerId);}catch{}}track.classList.add('is-dragging');track.scrollLeft=drag.left-dx;}});
  const finish=()=>{if(!drag)return;const moved=drag.moved;const dx=drag.dx||0;const startLeft=drag.left;drag=null;track.classList.remove('is-dragging');
   if(moved){suppressClick=true;const step=Math.max(1,getStep());const startIdx=Math.round(startLeft/step);
    const advance=Math.abs(dx)>step*.22?Math.sign(-dx):0; // короткий свайп/рывок листает целую карточку
    go((startIdx+advance)*step,true);setTimeout(()=>suppressClick=false,110);}};
 track.addEventListener('pointerup',finish);track.addEventListener('pointercancel',finish);track.addEventListener('pointerleave',event=>{if(drag&&event.buttons===0)finish();});
 track.addEventListener('click',event=>{if(suppressClick){event.preventDefault();event.stopPropagation();}},true);
 window.addEventListener('resize',onScroll,{passive:true});requestAnimationFrame(syncUI);
 return()=>{track.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll);};
}
