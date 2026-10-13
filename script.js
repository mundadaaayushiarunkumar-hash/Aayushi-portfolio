if('scrollRestoration' in history) history.scrollRestoration='manual';
const openAtHome=!location.hash||location.hash==='#home';
if(openAtHome){
  window.scrollTo(0,0);
  requestAnimationFrame(()=>window.scrollTo(0,0));
  window.addEventListener('load',()=>window.scrollTo(0,0),{once:true});
}

const navLinks=[...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections=[...document.querySelectorAll('main section[id]')];
if ('IntersectionObserver' in window) {
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting) navLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')==='#'+entry.target.id));
  }),{rootMargin:'-25% 0px -60% 0px'});
  sections.forEach(section=>observer.observe(section));
}

const track=document.querySelector('.work-track');
const projectCards=[...document.querySelectorAll('.work-track .project')];
const projectDots=[...document.querySelectorAll('[data-project]')];
const setActiveProject=index=>projectDots.forEach((dot,dotIndex)=>{
  const active=dotIndex===index;
  dot.classList.toggle('active',active);
  if(active) dot.setAttribute('aria-current','true');
  else dot.removeAttribute('aria-current');
});
document.querySelectorAll('[data-scroll]').forEach(button=>button.addEventListener('click',()=>{
  const card=track.querySelector('.project');
  const gap=parseFloat(getComputedStyle(track).gap)||0;
  track.scrollBy({left:Number(button.dataset.scroll)*(card.getBoundingClientRect().width+gap),behavior:'smooth'});
}));
projectDots.forEach(dot=>dot.addEventListener('click',()=>{
  const card=projectCards[Number(dot.dataset.project)];
  if(!card) return;
  track.scrollTo({left:card.offsetLeft-track.offsetLeft,behavior:'smooth'});
  setActiveProject(Number(dot.dataset.project));
}));
let projectScrollFrame;
track?.addEventListener('scroll',()=>{
  cancelAnimationFrame(projectScrollFrame);
  projectScrollFrame=requestAnimationFrame(()=>{
    const left=track.scrollLeft;
    let closest=0;
    let distance=Infinity;
    projectCards.forEach((card,index)=>{
      const nextDistance=Math.abs((card.offsetLeft-track.offsetLeft)-left);
      if(nextDistance<distance){distance=nextDistance;closest=index;}
    });
    setActiveProject(closest);
  });
},{passive:true});

const sidequestTrack=document.querySelector('.sidequest-track');
const sidequestCards=[...document.querySelectorAll('.sidequest-card')];
const sidequestDots=[...document.querySelectorAll('[data-sidequest]')];
const setActiveSidequest=index=>sidequestDots.forEach((dot,dotIndex)=>{
  const active=dotIndex===index;
  dot.classList.toggle('active',active);
  if(active) dot.setAttribute('aria-current','true');
  else dot.removeAttribute('aria-current');
});
document.querySelectorAll('[data-sidequest-scroll]').forEach(button=>button.addEventListener('click',()=>{
  const card=sidequestTrack.querySelector('.sidequest-card');
  const gap=parseFloat(getComputedStyle(sidequestTrack).gap)||0;
  sidequestTrack.scrollBy({left:Number(button.dataset.sidequestScroll)*(card.getBoundingClientRect().width+gap),behavior:'smooth'});
}));
sidequestDots.forEach(dot=>dot.addEventListener('click',()=>{
  const index=Number(dot.dataset.sidequest);
  const maxScroll=Math.max(0,sidequestTrack.scrollWidth-sidequestTrack.clientWidth);
  sidequestTrack.scrollTo({left:index===0?0:maxScroll,behavior:'smooth'});
  setActiveSidequest(index);
}));
let sidequestScrollFrame;
sidequestTrack?.addEventListener('scroll',()=>{
  cancelAnimationFrame(sidequestScrollFrame);
  sidequestScrollFrame=requestAnimationFrame(()=>{
    const maxScroll=Math.max(0,sidequestTrack.scrollWidth-sidequestTrack.clientWidth);
    const progress=maxScroll?sidequestTrack.scrollLeft/maxScroll:0;
    setActiveSidequest(progress>=.5?1:0);
  });
},{passive:true});

const heroName=document.querySelector('.hero-name');
const heroGroup=document.querySelector('.hero-copy-group');
const heroIntro=document.querySelector('.hero-copy-group .hero-foot');
const alignHeroIntro=()=>{
  if(!heroName||!heroGroup||!heroIntro) return;
  if(window.matchMedia('(max-width: 640px)').matches){
    heroIntro.style.width='100%';
    return;
  }
  const groupLeft=heroGroup.getBoundingClientRect().left;
  const nameRight=heroName.getBoundingClientRect().right;
  heroIntro.style.width=`${Math.ceil(nameRight-groupLeft)}px`;
};
alignHeroIntro();
window.addEventListener('load',alignHeroIntro);
window.addEventListener('resize',alignHeroIntro);
if(document.fonts?.ready) document.fonts.ready.then(alignHeroIntro);
if('ResizeObserver' in window) new ResizeObserver(alignHeroIntro).observe(heroGroup);

const aboutTitle=document.querySelector('#about-title');
if(aboutTitle&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  aboutTitle.classList.add('type-ready');
  const startAboutTyping=()=>{
    aboutTitle.classList.remove('is-typing');
    void aboutTitle.offsetWidth;
    requestAnimationFrame(()=>aboutTitle.classList.add('is-typing'));
  };
  if('IntersectionObserver' in window){
    let aboutWasVisible=false;
    const aboutTypingObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting&&!aboutWasVisible){
        aboutWasVisible=true;
        startAboutTyping();
      }else if(!entry.isIntersecting){
        aboutWasVisible=false;
        aboutTitle.classList.remove('is-typing');
      }
    }),{threshold:.55});
    aboutTypingObserver.observe(aboutTitle);
  }else startAboutTyping();
}

const hero=document.querySelector('.hero');
heroName?.addEventListener('click',()=>{
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  hero.classList.add('animation-reset');
  void hero.offsetWidth;
  requestAnimationFrame(()=>hero.classList.remove('animation-reset'));
});

document.querySelectorAll('.project-meta').forEach(meta=>{
  const parts=meta.textContent.split(' · ');
  meta.textContent=parts.slice(0,2).join(' · ');
});

document.querySelectorAll('.project-tags').forEach(group=>{
  const labels=group.textContent.split('·').map(label=>label.trim()).filter(Boolean);
  group.replaceChildren(...labels.map(label=>{
    const item=document.createElement('span');
    item.textContent=label;
    return item;
  }));
});

const skillTabs=[...document.querySelectorAll('[data-skill-tab]')];
const skillPanels=[...document.querySelectorAll('[data-skill-panel]')];
const skillSection=document.querySelector('.bring-table');
skillTabs.forEach(tab=>tab.addEventListener('click',()=>{
  const selected=tab.dataset.skillTab;
  const closing=tab.classList.contains('active');
  skillSection?.classList.toggle('is-expanded',!closing);
  skillTabs.forEach(item=>{
    const active=!closing&&item===tab;
    item.classList.toggle('active',active);
    item.setAttribute('aria-selected',String(active));
  });
  skillPanels.forEach(panel=>{
    const active=!closing&&panel.dataset.skillPanel===selected;
    panel.classList.toggle('active',active);
    if(!active) panel.querySelectorAll(':scope > span').forEach(pill=>{
      pill.style.removeProperty('--drag-x');
      pill.style.removeProperty('--drag-y');
      pill.dataset.dragX='0';
      pill.dataset.dragY='0';
    });
  });
}));

const skillStage=document.querySelector('.skill-stage');
skillPanels.forEach(panel=>panel.querySelectorAll(':scope > span').forEach(pill=>{
  pill.dataset.dragX='0';
  pill.dataset.dragY='0';
  pill.addEventListener('pointerdown',event=>{
    if(!panel.classList.contains('active')||!skillStage) return;
    event.preventDefault();
    pill.setPointerCapture(event.pointerId);
    pill.classList.add('is-dragging');
    const startX=event.clientX;
    const startY=event.clientY;
    const baseX=Number(pill.dataset.dragX)||0;
    const baseY=Number(pill.dataset.dragY)||0;
    const stageRect=skillStage.getBoundingClientRect();
    const pillRect=pill.getBoundingClientRect();
    const minMoveX=stageRect.left-pillRect.left;
    const maxMoveX=stageRect.right-pillRect.right;
    const minMoveY=stageRect.top-pillRect.top;
    const maxMoveY=stageRect.bottom-pillRect.bottom;
    const move=moveEvent=>{
      const moveX=Math.min(maxMoveX,Math.max(minMoveX,moveEvent.clientX-startX));
      const moveY=Math.min(maxMoveY,Math.max(minMoveY,moveEvent.clientY-startY));
      const nextX=baseX+moveX;
      const nextY=baseY+moveY;
      pill.style.setProperty('--drag-x',`${nextX}px`);
      pill.style.setProperty('--drag-y',`${nextY}px`);
      pill.dataset.dragX=String(nextX);
      pill.dataset.dragY=String(nextY);
    };
    const finish=()=>{
      pill.classList.remove('is-dragging');
      pill.removeEventListener('pointermove',move);
      pill.removeEventListener('pointerup',finish);
      pill.removeEventListener('pointercancel',finish);
    };
    pill.addEventListener('pointermove',move);
    pill.addEventListener('pointerup',finish);
    pill.addEventListener('pointercancel',finish);
  });
}));

const finePointer=window.matchMedia('(hover:hover) and (pointer:fine)');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
if(finePointer.matches&&!reducedMotion.matches){
  document.documentElement.classList.add('portfolio-custom-cursor');
  const dot=document.createElement('span');
  const ring=document.createElement('span');
  dot.className='portfolio-cursor-dot';
  ring.className='portfolio-cursor-ring';
  dot.setAttribute('aria-hidden','true');
  ring.setAttribute('aria-hidden','true');
  document.body.append(dot,ring);
  let targetX=innerWidth/2,targetY=innerHeight/2;
  let ringX=targetX,ringY=targetY;
  const moveRing=()=>{
    ringX+=(targetX-ringX)*.18;
    ringY+=(targetY-ringY)*.18;
    ring.style.transform=`translate3d(${ringX}px,${ringY}px,0)`;
    requestAnimationFrame(moveRing);
  };
  requestAnimationFrame(moveRing);
  document.addEventListener('pointermove',event=>{
    targetX=event.clientX;
    targetY=event.clientY;
    dot.style.transform=`translate3d(${targetX}px,${targetY}px,0)`;
    const interactive=event.target.closest('a,button,[role="button"],.project,.sidequest-card,.question-bubble');
    ring.classList.toggle('is-interactive',Boolean(interactive));
  });
  document.addEventListener('pointerdown',()=>ring.classList.add('is-pressed'));
  document.addEventListener('pointerup',()=>ring.classList.remove('is-pressed'));
  document.addEventListener('pointerleave',()=>{
    dot.style.opacity='0';
    ring.style.opacity='0';
  });
  document.addEventListener('pointerenter',()=>{
    dot.style.opacity='';
    ring.style.opacity='';
  });
}
