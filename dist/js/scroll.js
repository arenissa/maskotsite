import {CONFIG} from './config.js';
import {clamp,range} from './math.js';
/** DOM opacity and transforms are pure functions of scroll progress: reverse scrolling is fully deterministic. */
export function initJourney(progress,reducedMotion){
 const journey=document.getElementById('journey'),logo=document.getElementById('introMark'),mascot=document.getElementById('mascotStage'),hero=document.getElementById('heroCopy');
 const hint=document.getElementById('rotationHint'),story=document.getElementById('storyCard'),chat=document.getElementById('chatCard'),cue=document.getElementById('scrollCue');
 const timeline=document.getElementById('timelineFill'),percent=document.getElementById('timelinePercent'),caption=document.getElementById('stageCaption');
  const header=document.getElementById('siteHeader'),merch=document.getElementById('merch');
  const headerImg=header.querySelector('img');
  const LOGO_BASE='assets/red-square-logo-transparent.png',LOGO_LIGHT='assets/red-square-logo-light.png';
  new Image().src=LOGO_LIGHT; // прогрев кеша для мгновенного переключения
 let scheduled=false;
 const lerp1=(p,a,b)=>range(p,a,b);
 const windowAlpha=(p,enterStart,enterEnd,exitStart,exitEnd)=>lerp1(p,enterStart,enterEnd)*(1-lerp1(p,exitStart,exitEnd));
 function apply(){scheduled=false;const height=journey.offsetHeight-window.innerHeight;
  const p=clamp(height? (window.scrollY-journey.offsetTop)/height:0);progress.current=p;
  const introFade=1-lerp1(p,.062,.223);
  logo.style.opacity=introFade.toFixed(3);logo.style.transform=`translate(-50%,-50%) scale(${(1+lerp1(p,.06,.23)*.29).toFixed(3)})`;
  mascot.style.opacity=lerp1(p,.065,.207).toFixed(3);
  const heroAlpha=windowAlpha(p,.205,.29,.625,.68);hero.style.opacity=heroAlpha.toFixed(3);
  const heroOffset=28*(1-lerp1(p,.21,.30));
  hero.style.transform=window.innerWidth<768?`translateY(${heroOffset}px)`:`translateY(calc(-45% + ${heroOffset}px))`;
  hint.style.opacity=windowAlpha(p,.28,.33,.61,.66).toFixed(3);
   const first=windowAlpha(p,.645,.684,.762,.798);
   for(const [el,alpha] of [[story,first]].filter(([el])=>el)){
    el.style.opacity=alpha.toFixed(3);
    el.classList.toggle('is-active',alpha>.12);
    const offset=(1-lerp1(alpha,0,.95))*23;
    el.style.transform=window.innerWidth<768?`translateY(${offset}px)`:`translateY(calc(-30% + ${offset}px)) translateX(0)`;
  }
  cue.style.opacity=(1-lerp1(p,.03,.16)).toFixed(3);
  timeline.style.height=`${Math.round(p*100)}%`;
  percent.textContent=String(Math.round(p*100)).padStart(2,'0');
   caption.textContent=p<.25?'01 / ТРАНСФОРМАЦИЯ':p<.64?'02 / ЗНАКОМСТВО':'03 / ИСТОРИЯ';
  const onDark=merch.getBoundingClientRect().top<120;
   header.classList.toggle('on-dark',onDark);
   if(headerImg&&headerImg.getAttribute('src')!==(onDark?LOGO_LIGHT:LOGO_BASE))headerImg.src=onDark?LOGO_LIGHT:LOGO_BASE;
 }
 function update(){if(!scheduled){scheduled=true;requestAnimationFrame(apply);}}
 window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update,{passive:true});
 document.querySelectorAll('[data-stage]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();const p=clamp(Number(link.dataset.stage));const target=journey.offsetTop+p*(journey.offsetHeight-window.innerHeight);window.scrollTo({top:target,behavior:reducedMotion?'instant':'smooth'});}));
 document.querySelector('.nav-brand').addEventListener('click',event=>{event.preventDefault();window.scrollTo({top:0,behavior:reducedMotion?'instant':'smooth'});});
 apply();return()=>{window.removeEventListener('scroll',update);window.removeEventListener('resize',update);};
}
