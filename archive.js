const root=document.documentElement;
if('scrollRestoration' in history) history.scrollRestoration='manual';
window.scrollTo(0,0);
const toggle=document.querySelector('#light-toggle');
const toggleLabel=toggle.querySelector('.toggle-label');
const archiveHeading=document.querySelector('.archive-intro h1');
toggle.addEventListener('click',()=>{
  const on=root.dataset.lights!=='on';
  root.dataset.lights=on?'on':'off';
  archiveHeading.style.setProperty('color',on?'#ffffff':'#575650','important');
  archiveHeading.style.setProperty('-webkit-text-fill-color',on?'#ffffff':'#575650','important');
  toggle.setAttribute('aria-pressed',String(on));
  toggle.setAttribute('aria-label',on?'Turn fairy lights off':'Turn fairy lights on');
  toggleLabel.textContent=on?'Lights on':'Lights off';
});

const board=document.querySelector('#archive-board');
const stage=document.querySelector('#board-stage');
const wrap=document.querySelector('.board-wrap');
const zoomOut=document.querySelector('#zoom-out');
const zoomIn=document.querySelector('#zoom-in');
const zoomFit=document.querySelector('#zoom-fit');
let boardScale=1;
const minScale=.2,maxScale=1.2;
const fitScale=()=>{
  const boardTop=stage.getBoundingClientRect().top;
  const availableHeight=Math.max(260,window.innerHeight-boardTop-24);
  return Math.min(
    maxScale,
    Math.max(minScale,Math.min((window.innerWidth-40)/board.offsetWidth,availableHeight/board.offsetHeight))
  );
};
const applyScale=(next,{center=true}={})=>{
  boardScale=clamp(next,minScale,maxScale);
  board.style.transform=`scale(${boardScale})`;
  stage.style.width=`${board.offsetWidth*boardScale}px`;
  stage.style.height=`${board.offsetHeight*boardScale}px`;
  zoomFit.classList.toggle('active',Math.abs(boardScale-fitScale())<.015);
  zoomOut.disabled=boardScale<=minScale+.001;
  zoomIn.disabled=boardScale>=maxScale-.001;
  if(center) wrap.scrollTo({left:Math.max(0,(stage.offsetWidth-wrap.clientWidth)/2),behavior:'smooth'});
};
zoomOut.addEventListener('click',()=>applyScale(boardScale-.1));
zoomIn.addEventListener('click',()=>applyScale(boardScale+.1));
zoomFit.addEventListener('click',()=>applyScale(fitScale()));
window.addEventListener('resize',()=>{if(zoomFit.classList.contains('active')) applyScale(fitScale(),{center:false})});
requestAnimationFrame(()=>applyScale(fitScale(),{center:false}));
let active=null,startX=0,startY=0,startLeft=0,startTop=0,moved=false;
const clamp=(value,min,max)=>Math.min(Math.max(value,min),max);

board.querySelectorAll('.archive-item').forEach(item=>{
  item.addEventListener('pointerdown',event=>{
    if(event.button!==0) return;
    event.preventDefault();
    active=item;moved=false;
    startX=event.clientX;startY=event.clientY;
    startLeft=item.offsetLeft;
    startTop=item.offsetTop;
    item.style.left=startLeft+'px';
    item.style.top=startTop+'px';
    item.classList.add('dragging');
    item.setPointerCapture(event.pointerId);
  });
  item.addEventListener('pointermove',event=>{
    if(active!==item) return;
    const dx=(event.clientX-startX)/boardScale,dy=(event.clientY-startY)/boardScale;
    if(Math.hypot(dx,dy)>5) moved=true;
    item.style.left=clamp(startLeft+dx,0,board.clientWidth-item.offsetWidth)+'px';
    item.style.top=clamp(startTop+dy,0,board.clientHeight-item.offsetHeight)+'px';
  });
  const endDrag=()=>{
    if(active!==item) return;
    item.classList.remove('dragging');
    active=null;
  };
  item.addEventListener('pointerup',endDrag);
  item.addEventListener('pointercancel',endDrag);
});

const tumbler=document.querySelector('.sipper-keepsake');
if(tumbler){
  const sway=()=>{
    tumbler.classList.remove('is-swaying');
    void tumbler.offsetWidth;
    tumbler.classList.add('is-swaying');
  };
  tumbler.addEventListener('pointerdown',sway);
  tumbler.addEventListener('animationend',()=>tumbler.classList.remove('is-swaying'));
}

const dialog=document.querySelector('#photo-dialog');
const dialogPhoto=dialog.querySelector('.dialog-photo');
const dialogCaption=dialog.querySelector('p');
const openPhoto=item=>{
  const image=item.querySelector('.photo img');
  dialogPhoto.src=item.dataset.photoSrc;
  dialogPhoto.alt=image.alt;
  dialogPhoto.style.objectPosition=getComputedStyle(image).objectPosition;
  dialogCaption.textContent=item.querySelector('p').textContent;
  root.classList.add('photo-dialog-open');
  dialog.showModal();
};
board.querySelectorAll('.polaroid').forEach(item=>{
  item.addEventListener('click',()=>{if(!moved) openPhoto(item)});
  item.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){event.preventDefault();openPhoto(item)}
  });
});
dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog) dialog.close()});
dialog.addEventListener('close',()=>root.classList.remove('photo-dialog-open'));

const fineArchivePointer=window.matchMedia('(hover:hover) and (pointer:fine)');
const archiveReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
if(fineArchivePointer.matches&&!archiveReducedMotion.matches){
  root.classList.add('archive-custom-cursor');
  const archiveCursor=document.createElement('span');
  archiveCursor.className='archive-cursor';
  archiveCursor.setAttribute('aria-hidden','true');
  document.body.append(archiveCursor);
  let targetX=innerWidth/2,targetY=innerHeight/2;
  let cursorX=targetX,cursorY=targetY;
  const animateArchiveCursor=()=>{
    cursorX+=(targetX-cursorX)*.2;
    cursorY+=(targetY-cursorY)*.2;
    archiveCursor.style.transform=`translate3d(${cursorX}px,${cursorY}px,0)`;
    requestAnimationFrame(animateArchiveCursor);
  };
  requestAnimationFrame(animateArchiveCursor);
  document.addEventListener('pointermove',event=>{
    targetX=event.clientX;
    targetY=event.clientY;
    const overDraggable=Boolean(event.target.closest('.archive-item'));
    root.classList.toggle('archive-cursor-grab',overDraggable);
  });
  document.addEventListener('pointerdown',event=>{
    if(event.target.closest('.archive-item')) root.classList.add('archive-cursor-grabbing');
  });
  document.addEventListener('pointerup',()=>root.classList.remove('archive-cursor-grabbing'));
  document.addEventListener('click',event=>{
    if(event.target.closest('button,a')) return;
    const sparkle=document.createElement('span');
    sparkle.className='archive-click-sparkle';
    sparkle.textContent='✦';
    sparkle.style.left=`${event.clientX}px`;
    sparkle.style.top=`${event.clientY}px`;
    sparkle.setAttribute('aria-hidden','true');
    document.body.append(sparkle);
    sparkle.addEventListener('animationend',()=>sparkle.remove(),{once:true});
  });
  document.addEventListener('pointerleave',()=>archiveCursor.style.opacity='0');
  document.addEventListener('pointerenter',()=>archiveCursor.style.opacity='');
}
