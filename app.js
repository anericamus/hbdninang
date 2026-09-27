const chapters=['hello','birthday','memories','letter','finale'];
const photos=['IMG_1394','IMG_1395','IMG_3961','IMG_3962','IMG_4820','IMG_4821','IMG_4822'];
let musicWanted=true,current='hello',photoIndex=0;
const music=document.querySelector('#background-music');
const musicStart=127;
let musicPositioned=false;
let musicStarted=false;
music.volume=0.35;
const video=document.querySelector('#birthday-video');
const sound=document.querySelector('#sound');
function soundState(playing){sound.setAttribute('aria-pressed',String(playing));sound.querySelector('span').textContent=playing?'Music on':'Play music';}
function positionMusic(){
  if(musicPositioned)return true;
  if(music.readyState<1)return false;
  music.currentTime=Number.isFinite(music.duration)&&music.duration<=musicStart?0:musicStart;
  musicPositioned=true;
  music.autoplay=musicWanted;
  return true;
}
function playMusic(){
  if(!musicWanted||!video.paused||!positionMusic())return;
  music.play().catch(error=>{
    if(error.name==='NotAllowedError'){soundState(false);sound.querySelector('span').textContent='Tap to play music';}
    else if(error.name!=='AbortError')sound.querySelector('span').textContent='Music unavailable';
  });
}
function pauseMusic(){music.pause();soundState(false);}
function go(id){if(!chapters.includes(id))return;resetWish();if(current==='finale'&&id!=='finale')video.pause();current=id;document.querySelectorAll('.scene').forEach(el=>{el.hidden=el.id!==id;});document.querySelectorAll('nav button').forEach(b=>{if(b.dataset.next===id)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});document.querySelector('#chapter').textContent=`0${chapters.indexOf(id)+1} / 05`;window.scrollTo({top:0,behavior:'instant'});playMusic();if(id==='birthday')confetti();document.querySelector(`#${id} h1, #${id} h2`).setAttribute('tabindex','-1');document.querySelector(`#${id} h1, #${id} h2`).focus({preventScroll:true});}
document.querySelectorAll('[data-next]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.next)));
document.querySelector('.wordmark').addEventListener('click',e=>{e.preventDefault();go('hello');});
sound.addEventListener('click',()=>{
  if(!music.paused){musicWanted=false;pauseMusic();}
  else{musicWanted=true;if(!video.paused)video.pause();playMusic();}
});
music.addEventListener('loadedmetadata',()=>{positionMusic();playMusic();});
// Attempt playback as soon as audio is ready; retry on a real user gesture
// if the browser does not permit audible autoplay.
music.addEventListener('canplay',()=>{if(!musicStarted)playMusic();});
function startMusicOnInteraction(event){
  if(event.target instanceof Element&&event.target.closest('#sound, #birthday-video'))return;
  if(event.type==='keydown'&&(event.repeat||!['Enter',' '].includes(event.key)))return;
  if(!musicStarted&&musicWanted)playMusic();
}
document.addEventListener('click',startMusicOnInteraction);
document.addEventListener('keydown',startMusicOnInteraction);
music.addEventListener('play',()=>{
  if(!video.paused||!musicWanted){pauseMusic();return;}
  musicStarted=true;
  document.removeEventListener('click',startMusicOnInteraction);
  document.removeEventListener('keydown',startMusicOnInteraction);
  soundState(true);
});
music.addEventListener('pause',()=>soundState(false));
music.addEventListener('ended',()=>{musicPositioned=false;playMusic();});
music.addEventListener('error',()=>{soundState(false);sound.querySelector('span').textContent='Music unavailable';});
playMusic();
video.addEventListener('play',pauseMusic);video.addEventListener('pause',playMusic);video.addEventListener('ended',()=>{playMusic();confetti();});
function confetti(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const box=document.querySelector('#confetti');for(let i=0;i<75;i++){const el=document.createElement('i');el.className='confetti-piece';el.style.cssText=`--left:${Math.random()*100}%;--duration:${2+Math.random()*2}s;--color:${['#a83d50','#d79992','#e6bd66','#c1a3ac','#fffaf4'][i%5]};--drift:${Math.random()*250-125}px;--spin:${Math.random()*360}deg;animation-delay:${Math.random()*.5}s`;box.append(el);setTimeout(()=>el.remove(),5000);}}
const wishButton=document.querySelector('#wish');
let wishTimer=null;
function resetWish(){
  clearTimeout(wishTimer);
  wishTimer=null;
  wishButton.disabled=false;
  wishButton.removeAttribute('aria-busy');
  wishButton.classList.remove('is-wishing');
  wishButton.textContent='Make a wish ✧';
  document.querySelector('#wish-note').textContent='';
}
wishButton.addEventListener('click',()=>{
  if(wishTimer!==null)return;
  wishButton.disabled=true;
  wishButton.setAttribute('aria-busy','true');
  wishButton.classList.add('is-wishing');
  wishButton.innerHTML='<span class="wish-spinner" aria-hidden="true"></span><span>Making a little wish…</span>';
  document.querySelector('#wish-note').textContent='Sana matupad, nang. ✧';
  confetti();
  wishTimer=setTimeout(()=>{if(current==='birthday')go('memories');else resetWish();},2400);
});
const collage=document.querySelector('#collage');photos.forEach((name,i)=>{const b=document.createElement('button');b.className='polaroid';b.style.setProperty('--rotation',`${[-5,4,-3,6,3,-5,4][i]}deg`);b.style.setProperty('--delay',`${i*.08}s`);b.setAttribute('aria-label',`Enlarge photo ${i+1}`);const img=document.createElement('img');img.src=`assets/${name}.jpg?v=2`;img.alt=`Ninang’s scrapbook photo ${i+1}`;img.loading='lazy';b.append(img);const caption=document.createElement('span');caption.textContent=`a little memory · 0${i+1}`;b.append(caption);b.onclick=()=>{photoIndex=i;showPhoto();document.querySelector('#photo-dialog').showModal();};collage.append(b);});
const dialog=document.querySelector('#photo-dialog');function showPhoto(){document.querySelector('#large-photo').src=`assets/${photos[photoIndex]}.jpg?v=2`;document.querySelector('#large-photo').alt=`Ninang’s scrapbook photo ${photoIndex+1}`;document.querySelector('#photo-count').textContent=`${photoIndex+1} / ${photos.length}`;}
function stepPhoto(n){photoIndex=(photoIndex+n+photos.length)%photos.length;showPhoto();}
dialog.querySelector('.close').onclick=()=>dialog.close();dialog.querySelector('.photo-prev').onclick=()=>stepPhoto(-1);dialog.querySelector('.photo-next').onclick=()=>stepPhoto(1);dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight')stepPhoto(1);if(e.key==='ArrowLeft')stepPhoto(-1);});
