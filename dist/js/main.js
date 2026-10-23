import {CONFIG} from './config.js';
import {initJourney} from './scroll.js';
import {initCarousel} from './carousel.js';
import {initOrder} from './order.js';
import {initReveal} from './reveal.js';
import {initLightbox} from './lightbox.js';
import {initStoryVideo} from './video.js';
import {createMascotRenderer} from './mascot3d.js';

const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const progress={current:0};

function initContent(){
 const headline=document.getElementById('storyHeadline');if(headline)headline.textContent=CONFIG.STORY_HEADING;
 const sub=document.getElementById('storySub');if(sub)sub.textContent=CONFIG.STORY_SUB||'';
}

function init(){
 initContent();
 initCarousel();
 initOrder();
 initReveal();
 initLightbox();
 initStoryVideo();
 initJourney(progress,reducedMotion);
 createMascotRenderer(document.getElementById('mascotCanvas'),{progress,reducedMotion});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();