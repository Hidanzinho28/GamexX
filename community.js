(() => {
  'use strict';
  const discord='https://discord.com/invite/gamexbrasil';
  const trustSymbols=[
    '<path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z"/>',
    '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
    '<path d="M4 21V5l10-3v19M14 9h6v12M2 21h20M8 7h2M8 11h2M8 15h2M17 13h1M17 17h1M8 21v-3h2v3"/>',
    '<path d="M4 13v-2a8 8 0 0 1 16 0v2M20 17v1a3 3 0 0 1-3 3h-4"/><rect x="2" y="11" width="4" height="7" rx="2"/><rect x="18" y="11" width="4" height="7" rx="2"/>'
  ];
  document.querySelectorAll('section.trust .trust-item .ic').forEach((holder,index)=>{
    if(!trustSymbols[index])return;
    holder.setAttribute('aria-hidden','true');
    holder.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+trustSymbols[index]+'</svg>';
  });
  const icon=(name)=>'<svg stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">'+({chat:'<path d="M7 18 3 21V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H7Z"/><path d="M7 8h10M7 12h7"/>',discord:'<path fill="currentColor" stroke="none" fill-rule="evenodd" d="M19.73 4.55a19.5 19.5 0 0 0-4.89-1.52l-.61 1.25a18.1 18.1 0 0 0-4.46 0l-.62-1.25a19.8 19.8 0 0 0-4.9 1.52C1.16 9.12.32 13.59.74 18a19.9 19.9 0 0 0 6 3.01l1.23-2a12 12 0 0 1-1.93-.93l.47-.37a14.3 14.3 0 0 0 11 0l.47.37c-.62.36-1.27.67-1.94.93l1.23 2a19.8 19.8 0 0 0 6-3.01c.51-5.11-.87-9.54-3.54-13.45ZM8.35 15.27c-1.08 0-1.97-.99-1.97-2.2s.87-2.2 1.97-2.2 1.99.99 1.97 2.2c0 1.21-.87 2.2-1.97 2.2Zm7.3 0c-1.08 0-1.97-.99-1.97-2.2s.87-2.2 1.97-2.2 1.99.99 1.97 2.2c0 1.21-.87 2.2-1.97 2.2Z"/>',shield:'<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Z"/><path d="m8 12 3 3 5-6"/>',pix:'<path d="m12 2 10 10-10 10L2 12 12 2Zm-6 6 6 6 6-6M6 16l6-6 6 6"/>'}[name])+'</svg>';
  const hero=document.querySelector('.hero-art');
  if(hero){
    hero.closest('.hero-grid').classList.add('gx-campaign-grid');
    const campaign=document.createElement('section');
    campaign.className='gx-banner-carousel';campaign.setAttribute('aria-label','Destaques GameX');campaign.setAttribute('aria-roledescription','carrossel');
    const banners=[['banner-gamex.png','GameX Digital Store — explore os produtos'],['banner-shop.png','GameX Shop — conheça a loja'],['banner-market.png','GameX — confira os destaques']];
    campaign.innerHTML='<div class="gx-banner-window"><div class="gx-banner-track" id="gx-banner-track">'+banners.map(([src,alt],i)=>'<div class="gx-banner-slide" role="group" aria-roledescription="slide" aria-label="'+(i+1)+' de '+banners.length+'"><a href="#produtos"><img src="assets/'+src+'" width="1672" height="941" alt="'+alt+'" '+(i===0?'fetchpriority="high"':'loading="eager"')+'></a></div>').join('')+'</div></div><div class="gx-banner-controls"><span class="gx-banner-count" aria-live="off">01 / 03</span><div class="gx-banner-dots">'+banners.map((b,i)=>'<button type="button" aria-label="Mostrar banner '+(i+1)+'" aria-controls="gx-banner-track"></button>').join('')+'</div><div class="gx-banner-actions"><button type="button" class="gx-banner-prev" aria-label="Banner anterior" aria-controls="gx-banner-track">←</button><button type="button" class="gx-banner-pause">Pausar</button><button type="button" class="gx-banner-next" aria-label="Próximo banner" aria-controls="gx-banner-track">→</button></div></div>';
    hero.closest('.hero').before(campaign);hero.remove();
    const bannerTrack=campaign.querySelector('.gx-banner-track'),slides=[...campaign.querySelectorAll('.gx-banner-slide')],dots=[...campaign.querySelectorAll('.gx-banner-dots button')],pause=campaign.querySelector('.gx-banner-pause'),motion=matchMedia('(prefers-reduced-motion: reduce)');
    let current=0,stopped=motion.matches,over=false,inside=false,touch=null,timer=null;
    function schedule(){clearTimeout(timer);if(!stopped&&!over&&!inside&&!document.hidden&&!motion.matches)timer=setTimeout(()=>show(current+1),5000);}
    function show(index){current=(index+slides.length)%slides.length;bannerTrack.style.transform='translateX(-'+current*100+'%)';slides.forEach((slide,i)=>{slide.inert=i!==current;slide.setAttribute('aria-hidden',String(i!==current));slide.querySelector('a').tabIndex=i===current?0:-1;});dots.forEach((dot,i)=>{dot.setAttribute('aria-current',i===current?'true':'false');});campaign.querySelector('.gx-banner-count').textContent='0'+(current+1)+' / 03';schedule();}
    function syncPause(){pause.textContent=stopped?'Reproduzir':'Pausar';pause.setAttribute('aria-label',stopped?'Iniciar troca automática dos banners':'Pausar troca automática dos banners');}
    pause.addEventListener('click',()=>{stopped=!stopped;syncPause();schedule();});
    campaign.querySelector('.gx-banner-prev').addEventListener('click',()=>show(current-1));campaign.querySelector('.gx-banner-next').addEventListener('click',()=>show(current+1));dots.forEach((dot,i)=>dot.addEventListener('click',()=>show(i)));
    campaign.addEventListener('mouseenter',()=>{over=true;schedule();});campaign.addEventListener('mouseleave',()=>{over=false;schedule();});campaign.addEventListener('focusin',()=>{inside=true;schedule();});campaign.addEventListener('focusout',e=>{inside=campaign.contains(e.relatedTarget);schedule();});document.addEventListener('visibilitychange',schedule);
    campaign.querySelector('.gx-banner-window').addEventListener('touchstart',e=>{touch={x:e.touches[0].clientX,y:e.touches[0].clientY};clearTimeout(timer);},{passive:true});
    campaign.querySelector('.gx-banner-window').addEventListener('touchend',e=>{if(touch){const x=e.changedTouches[0].clientX-touch.x,y=e.changedTouches[0].clientY-touch.y;if(Math.abs(x)>45&&Math.abs(x)>Math.abs(y))show(current+(x<0?1:-1));touch=null;schedule();}},{passive:true});
    campaign.querySelector('.gx-banner-window').addEventListener('touchcancel',()=>{touch=null;schedule();},{passive:true});
    motion.addEventListener('change',()=>{if(motion.matches)stopped=true;syncPause();schedule();});syncPause();show(0);
    const catalog=document.querySelector('#produtos');
    if(catalog)catalog.insertAdjacentHTML('beforebegin','<section class="wrap gx-promo-editorial" aria-labelledby="gx-promo-title"><a class="gx-promo-picture" href="#produtos" aria-label="Ver os pacotes disponíveis"><img src="assets/promo-gamex.png" width="941" height="1672" loading="lazy" alt="Arte promocional GameX com Robux e gift cards"></a><div class="gx-promo-copy"><span class="catalog-kicker">SEU PRÓXIMO JOGO COMEÇA AQUI</span><h2 id="gx-promo-title">Mais jogo.<br>Mais <em>possibilidades.</em></h2><p>Escolha seu pacote, confira os detalhes e prepare-se para a próxima partida.</p><a class="btn btn-primary" href="#produtos">Explorar produtos <span aria-hidden="true">↗</span></a><small>Consulte no catálogo os produtos e valores disponíveis.</small></div></section>');
  }
  document.querySelectorAll('footer img[alt*="GameX"]').forEach(img=>{const brand=document.createElement('span');brand.className='gx-footer-wordmark';brand.innerHTML='Game<b>X</b>';img.replaceWith(brand);});
  document.querySelectorAll('.card').forEach(card=>{
    if(/^(1200|1700) Robux$/.test(card.querySelector('h3')?.textContent.trim()||'')){
      card.classList.add('gx-special-product');
      card.insertAdjacentHTML('afterbegin','<span class="gx-offer-ribbon"><span aria-hidden="true">✦</span> OFERTA ESPECIAL</span>');
      const cover=card.querySelector('.cover'),ribbon=card.querySelector('.gx-offer-ribbon');
      if(cover){const positionRibbon=()=>{if(cover.clientHeight)ribbon.style.top=(cover.offsetTop+cover.clientHeight-30)+'px';};new ResizeObserver(positionRibbon).observe(cover);positionRibbon();}
    }
  });
  const reviews=[
    ['igabbssilva',4,'pedido entregue certinho mais demorou 8 minutos pra chegar no meu email porem chegou e deu certo, recomendo galera'],
    ['talokoplays',5,'Comprei 2 vezes com eles, top top topppp só queria deixar uma sugestão poderiam fazer um sorteio de algum pacote de robux, acho que seria bem legal'],
    ['Lucasjorgeb2',3,'comprei hoje 1700 robux porque o de 600 tava esgotado podiam melhorar os preços achei um pouco carro 19 reais'],
    ['HYDRAiii',5,'MuitoOOOOOOO bom recomendo'],
    ['ydoczlipe',5,'No inicio eu tava com medo pq é foda confiar nas lojas da internet mais chegou certinho pessoal 👏']
  ];
  document.querySelectorAll('.reviews-scroll').forEach((track,index)=>{
    track.classList.add('gx-reviews-track');track.id='gx-reviews-'+index;
    track.setAttribute('aria-label','Avaliações da comunidade GameX');track.tabIndex=0;
    track.innerHTML=reviews.map(([name,stars,quote])=>'<article class="review-card"><div class="gx-review-top"><span class="gx-review-avatar" aria-hidden="true">'+name[0].toUpperCase()+'</span><strong>'+name+'</strong></div><div class="stars" aria-label="'+stars+' de 5 estrelas">'+'★'.repeat(stars)+'<span aria-hidden="true">'+'★'.repeat(5-stars)+'</span></div><p>“'+quote+'”</p></article>').join('');
    const controls=document.createElement('div');controls.className='gx-review-controls';
    controls.innerHTML='<span>Histórias de quem joga com a gente</span><div><button type="button" aria-label="Avaliações anteriores" aria-controls="'+track.id+'">←</button><button type="button" class="gx-review-pause" aria-controls="'+track.id+'">Pausar</button><button type="button" aria-label="Próximas avaliações" aria-controls="'+track.id+'">→</button></div>';
    track.before(controls);
    const buttons=controls.querySelectorAll('button'),motion=matchMedia('(prefers-reduced-motion: reduce)');
    let paused=motion.matches,hover=false,focused=false,drag=null,last=0,direction=1,position=0;
    const sync=()=>{buttons[1].textContent=paused?'Reproduzir':'Pausar';buttons[1].setAttribute('aria-label',paused?'Iniciar movimento das avaliações':'Pausar movimento das avaliações');};sync();
    buttons[1].addEventListener('click',()=>{paused=!paused;sync();});
    const move=(sign)=>{paused=true;sync();track.scrollBy({left:sign*(track.firstElementChild.getBoundingClientRect().width+18),behavior:motion.matches?'auto':'smooth'});};
    buttons[0].addEventListener('click',()=>move(-1));buttons[2].addEventListener('click',()=>move(1));
    track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}});
    track.addEventListener('mouseenter',()=>hover=true);track.addEventListener('mouseleave',()=>hover=false);
    track.parentElement.addEventListener('focusin',()=>focused=true);track.parentElement.addEventListener('focusout',e=>focused=track.parentElement.contains(e.relatedTarget));
    track.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={x:e.clientX,left:track.scrollLeft};track.setPointerCapture(e.pointerId);track.classList.add('is-dragging');});
    track.addEventListener('pointermove',e=>{if(drag)track.scrollLeft=drag.left-(e.clientX-drag.x);});
    const end=()=>{drag=null;track.classList.remove('is-dragging');};track.addEventListener('pointerup',end);track.addEventListener('pointercancel',end);
    track.addEventListener('touchstart',()=>{paused=true;sync();},{passive:true});
    motion.addEventListener('change',()=>{if(motion.matches){paused=true;sync();}});
    function animate(now){const delta=Math.min(now-last,50);last=now;if(!paused&&!hover&&!focused&&!drag&&!document.hidden&&!motion.matches){const max=track.scrollWidth-track.clientWidth;if(max>0){position=Math.max(0,Math.min(max,position+direction*delta*.028));track.scrollLeft=position;if(position>=max)direction=-1;if(position<=0)direction=1;}}else{position=track.scrollLeft;}requestAnimationFrame(animate);}requestAnimationFrame(animate);
  });
  const footer=document.querySelector('footer');
  footer?.insertAdjacentHTML('beforebegin','<section class="gx-assurance" aria-label="Informações da loja"><div class="wrap gx-assurance-grid"><div>'+icon('pix')+'<span><strong>Pagamento via PIX</strong><small>QR Code e Copia e Cola</small></span></div><div>'+icon('shield')+'<span><strong>Sua senha é só sua</strong><small>Não pedimos a senha da conta</small></span></div><div>'+icon('chat')+'<span><strong>Fale com a GameX</strong><small>Atendimento por e-mail e Discord</small></span></div></div></section>');
  const topBanner=document.querySelector('.gx-banner-carousel');
  const assurances=document.querySelector('.gx-assurance');
  const catalog=document.querySelector('#produtos');
  if(topBanner&&catalog){
    catalog.classList.add('gx-catalog-first');topBanner.after(catalog);
    const trust=document.querySelector('section.trust');
    if(trust)topBanner.after(trust);
    if(assurances){assurances.classList.add('gx-banner-assurance');catalog.after(assurances);}
    const tools=catalog.querySelector('.catalog-tools');
    if(tools){
      const filters=document.createElement('details');filters.className='gx-catalog-filters';
      const summary=document.createElement('summary');summary.textContent='Buscar e ordenar pacotes';
      filters.append(summary);tools.before(filters);filters.append(tools);
      const tabs=catalog.querySelector('.cat-pills');
      if(tabs){const toolbar=document.createElement('div');toolbar.className='gx-catalog-toolbar';tabs.before(toolbar);toolbar.append(tabs,filters);}
    }
  }
  document.body.insertAdjacentHTML('beforeend','<nav class="gx-contact-dock" aria-label="Canais de atendimento"><a href="'+discord+'" target="_blank" rel="noopener noreferrer" aria-label="Entrar no Discord da GameX">'+icon('discord')+'<span>Discord</span></a><a href="mailto:suporte@agamexbrasil.com" aria-label="Falar com o suporte por e-mail">'+icon('chat')+'<span>Suporte</span></a></nav>');
})();
