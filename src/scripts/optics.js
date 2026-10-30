// Adapted from codemaester/physik-optik; see documentation/OPTIK_IMPORT.md.

(function(){
  'use strict';
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const rad=d=>d*Math.PI/180;
  const deg=r=>r*180/Math.PI;
  const fmt=(v,d=1)=>Number(v).toLocaleString('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d});
  const point=(cx,cy,len,ang)=>({x:cx+len*Math.cos(rad(ang)),y:cy+len*Math.sin(rad(ang))});
  const line=(cls,a,b,extra='')=>`<line class="${cls}" x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" ${extra}></line>`;
  const txt=(x,y,t,cls='live-svg-text')=>`<text class="${cls}" x="${x}" y="${y}">${t}</text>`;
  const media={
    air:{name:'Luft',n:1.00}, water:{name:'Wasser',n:1.33}, acrylic:{name:'Acrylglas',n:1.49}, glass:{name:'Glas',n:1.50}, diamond:{name:'Diamant',n:2.42}
  };
  const mediumOptions=(keys)=>keys.map(k=>`<option value="${k}">${media[k].name} (n=${String(media[k].n).replace('.',',')})</option>`).join('');

  function shell(title,subtitle,controls){
    const box=document.createElement('div');
    box.className='live-sim';
    box.innerHTML=`<div class="live-top"><div><div class="live-title">${title}</div><div class="live-subtitle">${subtitle}</div></div><div class="live-badge">Interaktiv</div></div><div class="live-grid"><div class="live-controls">${controls}<button class="live-reset" type="button">↺ Ausgangslage</button></div><div class="live-stage-wrap"><div class="live-stage"><svg viewBox="0 0 760 430" role="img" aria-label="${title}"></svg></div><div class="live-caption"></div><div class="live-explain"></div></div></div>`;
    return box;
  }
  function controlRange(id,label,min,max,step,value,unit,hint=''){
    return `<div class="control-card"><label for="${id}">${label}<span class="control-value" data-value-for="${id}"></span></label><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-unit="${unit}">${hint?`<div class="control-hint">${hint}</div>`:''}</div>`;
  }
  function controlSelect(id,label,options,hint=''){
    return `<div class="control-card"><label for="${id}">${label}</label><select id="${id}">${options}</select>${hint?`<div class="control-hint">${hint}</div>`:''}</div>`;
  }
  function metric(label,value){return `<div class="metric"><small>${label}</small><strong>${value}</strong></div>`}
  // Keep annotations readable when the fixed scientific viewBox is scaled down.
  // Only text size/position changes; rays and all model coordinates stay intact.
  function fitAnnotations(box){
    const svg=box.querySelector('svg');
    const scale=svg?.getScreenCTM()?.a;
    if(!scale||!svg.getBoundingClientRect().width)return;
    const labels=[...svg.querySelectorAll('text')];
    labels.forEach(text=>{
      text.dataset.originalX??=text.getAttribute('x');
      text.dataset.originalY??=text.getAttribute('y');
      text.setAttribute('x',text.dataset.originalX);
      text.setAttribute('y',text.dataset.originalY);
      text.style.removeProperty('font-size');
    });
    if(scale>=.65)return;
    const columns=new Map();
    labels.forEach(text=>{
      text.style.fontSize=`${(text.classList.contains('live-svg-label')?11.5:11)/scale}px`;
      const x=Number(text.dataset.originalX);
      if(!columns.has(x))columns.set(x,[]);
      columns.get(x).push(text);
    });
    columns.forEach(column=>{
      column.sort((a,b)=>Number(a.dataset.originalY)-Number(b.dataset.originalY));
      let previousOriginal=-Infinity,previousY=-Infinity;
      column.forEach(text=>{
        const original=Number(text.dataset.originalY);
        const y=original-previousOriginal<=35?Math.max(original,previousY+15/scale):original;
        text.setAttribute('y',String(y));
        previousOriginal=original;previousY=y;
      });
    });
    const padding=8/scale;
    labels.forEach(text=>{
      const bounds=text.getBBox();
      const x=Number(text.getAttribute('x'));
      if(bounds.x+bounds.width>760-padding)text.setAttribute('x',String(x-(bounds.x+bounds.width-760+padding)));
      else if(bounds.x<padding)text.setAttribute('x',String(x+padding-bounds.x));
    });
  }
  function setup(chapterId,box,defaults,render){
    const fallback=document.querySelector(`#${chapterId} .css-sim`);
    if(!fallback) throw new Error('Fallback not found: '+chapterId);
    fallback.before(box);
    // Ensure the initial controls match the same canonical values used by Reset.
    // Native <select> otherwise defaults to its first option, which can differ
    // from the intended model configuration and produce misleading readings.
    Object.entries(defaults).forEach(([id,v])=>{
      const el=box.querySelector('#'+id);
      if(el){if(el.type==='checkbox') el.checked=!!v; else el.value=v;}
    });
    const inputs=[...box.querySelectorAll('input,select')];
    const updateValues=()=>{
      box.querySelectorAll('input[type=range]').forEach(el=>{
        const out=box.querySelector(`[data-value-for="${el.id}"]`);
        const valueText=`${String(el.value).replace('.',',')} ${el.dataset.unit||''}`.trim();
        if(out) out.textContent=valueText;
        el.setAttribute('aria-valuetext',valueText);
      });
    };
    const doRender=()=>{updateValues();render(box);fitAnnotations(box)};
    inputs.forEach(el=>el.addEventListener(el.type==='range'?'input':'change',doRender));
    box.querySelector('.live-reset').addEventListener('click',()=>{
      Object.entries(defaults).forEach(([id,v])=>{const el=box.querySelector('#'+id);if(el){if(el.type==='checkbox')el.checked=!!v;else el.value=v;}});
      doRender();
    });
    doRender();
    new ResizeObserver(()=>fitAnnotations(box)).observe(box);
  }

  function simSurface(){
    // Didactic energy partition, not measured Fresnel values.
    // Diffuse reflection/transmission is a *material property*, not an adjustable roughness control.
    const materials={
      mirror:{name:'Spiegel',R:.92,T:0,A:.08,diffR:.02,diffT:0,note:'Der glatte Spiegel reflektiert Licht überwiegend geordnet.'},
      white:{name:'Matte weiße Wand',R:.78,T:0,A:.22,diffR:.98,diffT:0,note:'Die matte Wand reflektiert Licht in viele Richtungen: diffuse Reflexion.'},
      glass:{name:'Klarglas',R:.08,T:.90,A:.02,diffR:.02,diffT:.02,note:'Klarglas lässt das meiste Licht fast ungestört hindurch.'},
      black:{name:'Schwarze Fläche',R:.05,T:0,A:.95,diffR:.90,diffT:0,note:'Die dunkle Fläche absorbiert im Modell fast das gesamte einfallende Licht.'},
      frost:{name:'Milchglas',R:.12,T:.78,A:.10,diffR:.65,diffT:.96,note:'Milchglas lässt Licht hindurch, streut es aber: Man sieht nicht klar hindurch.'}
    };
    const opts=Object.entries(materials).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('');
    const box=shell('Grenzflächen-Labor','Wähle ein Material und verändere den Einfallswinkel. Die Strahlen zeigen Reflexion, Absorption, Transmission und Streuung. Die Zahlen sind ein vereinfachtes Modell.',
      controlSelect('s1mat','Material',opts)+controlRange('s1ang','Einfallswinkel α',0,80,1,35,'°'));
    setup('k1',box,{s1mat:'glass',s1ang:35},b=>{
      const m=materials[b.querySelector('#s1mat').value], a=+b.querySelector('#s1ang').value;
      let R=m.R, T=m.T, A=m.A;
      if(T>0){ const grazing=Math.pow(a/80,2)*.18;R=clamp(R+grazing,0,.7);T=Math.max(0,1-R-A); }
      const refDiffuse=R*m.diffR,refDirected=R-refDiffuse;
      const transDiffuse=T*m.diffT,transDirected=T-transDiffuse;
      const cx=350,cy=215,L=230,nAng=-90;
      const src=point(cx,cy,L,nAng-a),refl=point(cx,cy,L,nAng+a),trans=point(cx,cy,L,90-a*.55);
      let rays=line('live-ray-in live-beam',src,{x:cx,y:cy});
      if(refDirected>.012)rays+=line('live-ray-ref live-beam',{x:cx,y:cy},refl,`opacity="${clamp(.25+refDirected,0,1)}"`);
      if(transDirected>.012)rays+=line('live-ray-out live-beam',{x:cx,y:cy},trans,`opacity="${clamp(.25+transDirected,0,1)}"`);
      if(refDiffuse>.012){for(let i=-4;i<=4;i++){
        rays+=line('live-ray-faint',{x:cx,y:cy},point(cx,cy,165,nAng+a+i*17),`opacity="${clamp(refDiffuse*1.3,.16,.84)}"`);
      }}
      if(transDiffuse>.012){for(let i=-4;i<=4;i++){
        rays+=line('live-ray-out',{x:cx,y:cy},point(cx,cy,165,90-a*.55+i*17),`opacity="${clamp(transDiffuse*.8,.15,.75)}"`);
      }}
      const svg=b.querySelector('svg');
      svg.innerHTML=`<rect x="0" y="0" width="760" height="430" rx="18" fill="transparent"></rect><line class="live-surface" x1="90" y1="215" x2="690" y2="215"></line><line class="live-normal" x1="350" y1="35" x2="350" y2="395"></line>${rays}<circle cx="350" cy="215" r="${14+28*A}" fill="#d96b45" opacity="${.15+.55*A}"></circle>${txt(34,42,m.name,'live-svg-label')}${txt(34,66,`α = ${a}°`,'live-svg-small')}${txt(525,394,'Transmission / Streuung','live-svg-small')}${txt(523,52,'Reflexion / Streuung','live-svg-small')}`;
      b.querySelector('.live-caption').innerHTML=metric('Reflexion',Math.round(R*100)+' %')+metric('Transmission',Math.round(T*100)+' %')+metric('Absorption',Math.round(A*100)+' %');
      b.querySelector('.live-explain').textContent=m.note + (m===materials.glass?' Bei einem größeren Einfallswinkel steigt der Reflexionsanteil im Modell.':'');
    });
  }

  function simShadow(){
    const box=shell('Schattenlabor','Verändere Größe der Lichtquelle, Gegenstandsposition und Gegenstandsgröße. Bei einer ausgedehnten Lichtquelle entstehen Kern- und Halbschatten.',
      controlRange('s2src','Größe der Lichtquelle',0,130,2,70,'')+controlRange('s2pos','Gegenstandsposition',28,76,1,50,'%')+controlRange('s2obj','Gegenstandsgröße',60,180,2,110,'px'));
    setup('k2',box,{s2src:70,s2pos:50,s2obj:110},b=>{
      const s=+b.querySelector('#s2src').value, pos=+b.querySelector('#s2pos').value, oh=+b.querySelector('#s2obj').value;
      const sx=90,screenX=690,cy=215, ox=sx+(screenX-sx)*(pos/100), st=cy-s/2,sb=cy+s/2,ot=cy-oh/2,ob=cy+oh/2;
      const project=(sy,oy)=>sy+(oy-sy)*(screenX-sx)/(ox-sx);
      const iTop=[project(st,ot),project(st,ob)].sort((a,c)=>a-c), iBot=[project(sb,ot),project(sb,ob)].sort((a,c)=>a-c);
      const outerTop=Math.max(25,Math.min(iTop[0],iBot[0])), outerBot=Math.min(405,Math.max(iTop[1],iBot[1]));
      const umbraTop=Math.max(iTop[0],iBot[0]), umbraBot=Math.min(iTop[1],iBot[1]);
      const hasUmbra=umbraTop<umbraBot;
      const rayPts=[[st,ot],[st,ob],[sb,ot],[sb,ob]].map(([sy,oy])=>({a:{x:sx,y:sy},b:{x:screenX,y:project(sy,oy)}}));
      const svg=b.querySelector('svg');
      svg.innerHTML=`<rect x="0" y="0" width="760" height="430" fill="transparent"></rect><line class="live-screen" x1="690" y1="25" x2="690" y2="405"></line><line x1="90" y1="${st}" x2="90" y2="${sb}" stroke="#f2b600" stroke-width="12" stroke-linecap="round"></line>${rayPts.map(r=>line('live-guide',r.a,r.b)).join('')}<line class="live-object" x1="${ox}" y1="${ot}" x2="${ox}" y2="${ob}"></line><rect x="679" y="${outerTop}" width="22" height="${Math.max(0,outerBot-outerTop)}" rx="5" fill="#8c96a8" opacity=".26"></rect>${hasUmbra?`<rect x="677" y="${clamp(umbraTop,25,405)}" width="26" height="${Math.max(0,clamp(umbraBot,25,405)-clamp(umbraTop,25,405))}" rx="5" fill="#111827" opacity=".82"></rect>`:''}${txt(34,45,s===0?'Punktlichtquelle':'ausgedehnte Lichtquelle','live-svg-label')}${txt(595,35,'Schirm','live-svg-small')}${hasUmbra?txt(548,215,'Kernschatten','live-svg-small'):txt(510,215,'kein Kernschatten mehr','live-svg-small')}`;
      const outer=Math.max(0,outerBot-outerTop), umb=hasUmbra?Math.max(0,umbraBot-umbraTop):0;
      b.querySelector('.live-caption').innerHTML=metric('Schatten gesamt',Math.round(outer)+' px')+metric('Kernschatten',Math.round(umb)+' px')+metric('Objekt–Schirm',Math.round(screenX-ox)+' rel. E.');
      b.querySelector('.live-explain').innerHTML=s===0?'Eine Punktlichtquelle erzeugt nur einen scharf begrenzten Schatten.':'Die Randstrahlen der oberen und unteren Quellkante erzeugen Halbschatten. Wird die Lichtquelle groß genug, kann der Kernschatten ganz verschwinden.';
    });
  }

  function simReflection(){
    const box=shell('Reflexionsgesetz – live','Ändere Einfallswinkel und Spiegelneigung. Der reflektierte Strahl bleibt immer symmetrisch zum Lot: α = β.',
      controlRange('s3ang','Einfallswinkel α',0,80,1,45,'°')+controlRange('s3tilt','Spiegelneigung',-25,25,1,0,'°','Das Lot dreht sich immer mit dem Spiegel mit.'));
    setup('k3',box,{s3ang:45,s3tilt:0},b=>{
      const a=+b.querySelector('#s3ang').value, tilt=+b.querySelector('#s3tilt').value, cx=380,cy=220,L=235;
      const mirrorA=point(cx,cy,300,tilt+180),mirrorB=point(cx,cy,300,tilt),normalAng=tilt-90,src=point(cx,cy,L,normalAng-a),out=point(cx,cy,L,normalAng+a),na=point(cx,cy,180,normalAng),nb=point(cx,cy,180,normalAng+180);
      b.querySelector('svg').innerHTML=`${line('live-surface',mirrorA,mirrorB)}${line('live-normal',na,nb)}${line('live-ray-in live-beam',src,{x:cx,y:cy})}${line('live-ray-ref live-beam',{x:cx,y:cy},out)}<circle cx="${src.x}" cy="${src.y}" r="9" fill="#f0a11a"></circle><circle cx="${cx}" cy="${cy}" r="6" fill="currentColor"></circle>${txt(35,45,`α = ${a}°`,'live-svg-label')}${txt(35,69,`β = ${a}°`,'live-svg-label')}${txt(35,93,`Spiegel: ${tilt>0?'+':''}${tilt}°`,'live-svg-small')}${txt(392,64,'Lot','live-svg-small')}`;
      b.querySelector('.live-caption').innerHTML=metric('Einfallswinkel α',a+'°')+metric('Reflexionswinkel β',a+'°')+metric('Differenz','0°');
      b.querySelector('.live-explain').innerHTML=`Egal wie du Spiegel oder Strahl veränderst: <b>α = β</b>. Entscheidend ist, dass beide Winkel <b>zum Lot</b> gemessen werden – nicht zur Spiegeloberfläche.`;
    });
  }

  function simMirror(){
    const box=shell('Virtuelles Spiegelbild','Verändere Abstand und Größe des Gegenstands. Das virtuelle Bild liegt immer gleich weit hinter dem Spiegel und ist gleich groß.',
      controlRange('s4dist','Gegenstandsabstand',30,250,5,110,'cm')+controlRange('s4height','Gegenstandshöhe',60,180,5,120,'cm')+`<div class="control-card"><label><input id="s4rays" type="checkbox" checked>Hilfsstrahlen anzeigen</label><div class="control-hint">Die gestrichelten Verlängerungen treffen sich scheinbar hinter dem Spiegel.</div></div>`);
    setup('k4',box,{s4dist:110,s4height:120,s4rays:true},b=>{
      const d=+b.querySelector('#s4dist').value,h=+b.querySelector('#s4height').value,show=b.querySelector('#s4rays').checked,mx=380,base=350,scaleD=1.05,scaleH=1.3,ox=mx-clamp(d*scaleD,75,275),ix=mx+clamp(d*scaleD,75,275),top=base-clamp(h*scaleH,85,240);
      const eye={x:55,y:185};
      let rays='';
      if(show){
        // The ray actually runs FROM the object point TO the mirror and then to the eye.
        // Extend the reflected ray backwards: it intersects the virtual image point.
        for(const yy of [top,top+(base-top)*.58]){
          const img={x:ix,y:yy},obj={x:ox,y:yy};
          const u=(mx-eye.x)/(ix-eye.x);
          const hit={x:mx,y:eye.y+(yy-eye.y)*u};
          rays+=line('live-ray-in',obj,hit,'opacity=".70"')+line('live-ray-ref',hit,eye,'opacity=".72"')+line('live-guide',hit,img);
        }
      }
      const observer=`<circle cx="${eye.x}" cy="${eye.y}" r="7" fill="#f0a11a"></circle>`+txt(30,166,'Auge','live-svg-small');
      b.querySelector('svg').innerHTML=`<line class="live-mirror" x1="${mx}" y1="35" x2="${mx}" y2="390"></line><line class="live-object" x1="${ox}" y1="${base}" x2="${ox}" y2="${top}"></line><circle cx="${ox}" cy="${top}" r="10" fill="#df5a54"></circle><line class="live-image" x1="${ix}" y1="${base}" x2="${ix}" y2="${top}"></line><circle cx="${ix}" cy="${top}" r="9" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="5 5" opacity=".45"></circle><line class="live-guide" x1="${ox}" y1="${top}" x2="${ix}" y2="${top}"></line>${rays}${observer}${txt(45,405,'Gegenstand','live-svg-label')}${txt(590,405,'virtuelles Bild','live-svg-label')}${txt(394,55,'Spiegel','live-svg-small')}`;
      b.querySelector('.live-caption').innerHTML=metric('Gegenstandsabstand',d+' cm')+metric('Bildabstand',d+' cm')+metric('Bildgröße',h+' cm');
      b.querySelector('.live-explain').innerHTML=`Das Bild ist <b>virtuell</b>: Hinter dem Spiegel laufen keine echten Lichtstrahlen zusammen. Dein Auge verlängert die reflektierten Strahlen gedanklich rückwärts.`;
    });
  }

  function simMirrorHeight(){
    const box=shell('Wie groß muss ein Ganzkörperspiegel sein?','Spiele mit Körpergröße und Abstand. Die Strahlenkonstruktion zeigt: Der Mindestspiegel bleibt immer halb so hoch wie die Person.',
      controlRange('s5height','Körpergröße',140,205,1,175,'cm')+controlRange('s5dist','Abstand zum Spiegel',0.5,4,0.1,1.5,'m','Beobachte: Der Abstand verändert den Strahlenverlauf, nicht die nötige Spiegelhöhe.'));
    setup('k5',box,{s5height:175,s5dist:1.5},b=>{
      const H=+b.querySelector('#s5height').value,d=+b.querySelector('#s5dist').value;
      // Keep the same scale on both axes: changing height must resize the person
      // and mirror, while changing distance only moves the person horizontally.
      const scale=1.4,mx=620,footY=375,headY=footY-H*scale,eyeY=footY-(H-10)*scale,px=mx-d*100*scale;
      const headRadius=10*scale,headMirror=(headY+eyeY)/2,footMirror=(footY+eyeY)/2;
      const eye={x:px,y:eyeY};const head={x:px,y:headY},feet={x:px,y:footY},mh={x:mx,y:headMirror},mf={x:mx,y:footMirror};
      b.querySelector('svg').innerHTML=`<line class="live-mirror" x1="${mx}" y1="${headMirror}" x2="${mx}" y2="${footMirror}"></line><line stroke="currentColor" stroke-width="7" stroke-linecap="round" x1="${px}" y1="${headY+2*headRadius}" x2="${px}" y2="${footY}"></line><circle cx="${px}" cy="${headY+headRadius}" r="${headRadius}" fill="none" stroke="currentColor" stroke-width="5"></circle><circle cx="${eye.x}" cy="${eye.y}" r="6" fill="#f0a11a"></circle>${line('live-ray-in',head,mh,'opacity=".72"')}${line('live-ray-ref',mh,eye,'opacity=".72"')}${line('live-ray-in',feet,mf,'opacity=".72"')}${line('live-ray-ref',mf,eye,'opacity=".72"')}<line class="live-guide" x1="${px}" y1="${headMirror}" x2="${mx}" y2="${headMirror}"></line><line class="live-guide" x1="${px}" y1="${footMirror}" x2="${mx}" y2="${footMirror}"></line>${txt(34,45,`Person: ${H} cm`,'live-svg-label')}${txt(34,69,`Abstand: ${fmt(d,1)} m`,'live-svg-small')}${txt(635,200,'Spiegel','live-svg-label')}${txt(635,222,`${fmt(H/2,1)} cm`,'live-svg-label')}`;
      b.querySelector('.live-caption').innerHTML=metric('Körpergröße',H+' cm')+metric('Mindestspiegel',fmt(H/2,1)+' cm')+metric('Abhängigkeit vom Abstand','keine');
      b.querySelector('.live-explain').innerHTML=`Die Reflexionspunkte für Kopf und Füße liegen jeweils auf halber Höhe zwischen Auge und betrachtetem Punkt. Deshalb ist die nötige Spiegelhöhe immer <b>H / 2 = ${fmt(H/2,1)} cm</b>.`;
    });
  }

  function simRefraction(){
    const box=shell('Brechung nach dem Snelliusschen Gesetz','Wähle zwei Medien und verändere α. Die Simulation berechnet β live mit n₁·sin(α) = n₂·sin(β).',
      controlSelect('s6m1','Medium 1',mediumOptions(['air','water','glass','diamond']))+controlSelect('s6m2','Medium 2',mediumOptions(['air','water','glass','diamond']))+controlRange('s6ang','Einfallswinkel α',0,80,1,45,'°'));
    setup('k6',box,{s6m1:'air',s6m2:'glass',s6ang:45},b=>{
      const k1=b.querySelector('#s6m1').value,k2=b.querySelector('#s6m2').value,m1=media[k1],m2=media[k2],a=+b.querySelector('#s6ang').value,cx=380,cy=215,L=235;
      const ratio=m1.n/m2.n*Math.sin(rad(a)),tir=ratio>1, beta=tir?null:deg(Math.asin(clamp(ratio,-1,1))),src=point(cx,cy,L,-90-a),refl=point(cx,cy,L,-90+a);
      let out=''; if(!tir){const p=point(cx,cy,L,90-beta);out=line('live-ray-out live-beam',{x:cx,y:cy},p)}
      b.querySelector('svg').innerHTML=`<rect class="live-medium-a" x="0" y="0" width="760" height="215"></rect><rect class="live-medium-b" x="0" y="215" width="760" height="215"></rect><line class="live-surface" x1="35" y1="215" x2="725" y2="215"></line><line class="live-normal" x1="380" y1="30" x2="380" y2="400"></line>${line('live-ray-in live-beam',src,{x:cx,y:cy})}${line('live-ray-faint',{x:cx,y:cy},refl)}${out}${txt(35,45,`${m1.name}  n₁=${String(m1.n).replace('.',',')}`,'live-svg-label')}${txt(35,252,`${m2.name}  n₂=${String(m2.n).replace('.',',')}`,'live-svg-label')}${txt(515,58,`α = ${a}°`,'live-svg-label')}${tir?txt(480,335,'Totalreflexion','live-svg-label'):txt(500,335,`β = ${fmt(beta,1)}°`,'live-svg-label')}`;
      let relation='keine Ablenkung';if(!tir&&a>0){relation=beta<a?'zum Lot':'vom Lot weg';if(Math.abs(beta-a)<.05) relation='keine Richtungsänderung'}
      b.querySelector('.live-caption').innerHTML=metric('α',a+'°')+metric('β',tir?'—':fmt(beta,1)+'°')+metric('Verhalten',tir?'Totalreflexion':relation);
      const exp=b.querySelector('.live-explain');
      exp.className='live-explain'+(tir?' warn':'');
      exp.innerHTML=tir?`Für diesen Winkel verlangt das Brechungsgesetz sin(β) &gt; 1 – das ist unmöglich. Deshalb tritt <b>Totalreflexion</b> auf.`:(m1.n<m2.n?`n₂ ist größer: Der Strahl wird <b>zum Lot</b> gebrochen (β &lt; α).`:(m1.n>m2.n?`n₂ ist kleiner: Der Strahl wird <b>vom Lot weg</b> gebrochen (β &gt; α).`:`Beide Medien haben denselben Brechungsindex: Der Strahl ändert seine Richtung nicht.`));
    });
  }

  function simTIR(){
    const box=shell('Totalreflexion – Grenzwinkel exakt treffen','Lass Licht aus einem optisch dichteren Medium austreten. Der Grenzwinkel wird aus den Brechungsindizes berechnet; schiebe α darüber und beobachte den Umschlag.',
      controlSelect('s7m1','Inneres Medium',mediumOptions(['water','glass','diamond']))+controlSelect('s7m2','Äußeres Medium',mediumOptions(['air','water']))+controlRange('s7ang','Einfallswinkel α',0,85,0.01,35,'°')+'<button type="button" class="critical-jump">◎ Exakt auf den Grenzwinkel</button>');
    setup('k7',box,{s7m1:'glass',s7m2:'air',s7ang:35},b=>{
      const m1=media[b.querySelector('#s7m1').value],m2=media[b.querySelector('#s7m2').value],a=+b.querySelector('#s7ang').value,cx=380,cy=215,L=235;
      const possible=m1.n>m2.n,crit=possible?deg(Math.asin(m2.n/m1.n)):null,ratio=m1.n/m2.n*Math.sin(rad(a)),tir=possible&&a>crit+0.005,boundary=possible&&Math.abs(a-crit)<=0.005,beta=ratio<=1.000000001?deg(Math.asin(clamp(ratio,-1,1))):null,src=point(cx,cy,L,90+a),refl=point(cx,cy,L,90-a);
      let out='';if(!tir&&beta!==null){const p=point(cx,cy,L,-90+beta);out=line('live-ray-out live-beam',{x:cx,y:cy},p)}
      b.querySelector('svg').innerHTML=`<rect class="live-medium-b" x="0" y="0" width="760" height="215"></rect><rect class="live-medium-a" x="0" y="215" width="760" height="215"></rect><line class="live-surface" x1="35" y1="215" x2="725" y2="215"></line><line class="live-normal" x1="380" y1="30" x2="380" y2="400"></line>${line('live-ray-in live-beam',src,{x:cx,y:cy})}${line(tir?'live-ray-ref live-beam':'live-ray-faint',{x:cx,y:cy},refl)}${out}${txt(35,45,`${m2.name}  n₂=${String(m2.n).replace('.',',')}`,'live-svg-label')}${txt(35,252,`${m1.name}  n₁=${String(m1.n).replace('.',',')}`,'live-svg-label')}${tir?txt(505,335,'100 % zurück','live-svg-label'):(boundary?txt(500,130,'β ≈ 90°','live-svg-label'):txt(505,130,beta===null?'':`β = ${fmt(beta,1)}°`,'live-svg-label'))}`;
      const jump=b.querySelector('.critical-jump');if(jump){jump.disabled=!possible;jump.title=possible?`Grenzwinkel ${fmt(crit,2)}° einstellen`:'Nur beim Übergang vom dichteren ins dünnere Medium möglich'}
      const pct=clamp(a/85*100,0,100);
      b.querySelector('.live-caption').innerHTML=metric('Grenzwinkel',possible?fmt(crit,1)+'°':'nicht vorhanden')+metric('α',fmt(a,1)+'°')+metric('Zustand',!possible?'keine TIR möglich':tir?'Totalreflexion':boundary?'am Grenzwinkel':'Brechung + Reflexion');
      const exp=b.querySelector('.live-explain');exp.className='live-explain'+(tir?' good':boundary?' warn':'');
      exp.innerHTML=`<div>${!possible?'Totalreflexion ist hier unmöglich, weil n₁ ≤ n₂.':tir?`α = ${fmt(a,1)}° ist größer als α<sub>G</sub> = ${fmt(crit,1)}°. Es gibt keinen gebrochenen Strahl mehr.`:boundary?`Du bist praktisch genau am Grenzwinkel. Der gebrochene Strahl läuft entlang der Grenzfläche.`:`Noch unter dem Grenzwinkel: Ein Teil des Lichts tritt in ${m2.name} aus.`}</div>${possible?`<div class="critical-meter" aria-hidden="true"><span class="critical-marker" style="left:${pct}%"></span></div>`:''}`;
    });
    box.querySelector('.critical-jump').addEventListener('click',()=>{
      const m1=media[box.querySelector('#s7m1').value],m2=media[box.querySelector('#s7m2').value];
      if(m1.n<=m2.n)return;
      const crit=deg(Math.asin(m2.n/m1.n));
      const a=box.querySelector('#s7ang');a.value=crit.toFixed(2);
      a.dispatchEvent(new Event('input',{bubbles:true}));
    });
  }

  try{
    simSurface();simShadow();simReflection();simMirror();simMirrorHeight();simRefraction();simTIR();
    document.documentElement.classList.add('js-live');
  }catch(err){
    console.error('Live-Simulationen konnten nicht aktiviert werden; CSS-Fallback bleibt sichtbar.',err);
  }
})();




(function(){
  'use strict';
  const hosted=/^https?:$/.test(window.location.protocol);
  document.querySelectorAll('.video-modern[data-video-id]').forEach(card=>{
    const btn=card.querySelector('.video-embed');
    const panel=card.querySelector('.video-player');
    const id=card.dataset.videoId;
    if(!btn||!panel||!/^[A-Za-z0-9_-]{11}$/.test(id))return;
    panel.id='video-player-'+card.dataset.chapter;
    btn.setAttribute('aria-controls',panel.id);
    const action=card.querySelector('.video-actions');
    if(!hosted)return;
    btn.hidden=false;
    btn.textContent='▶ Hier abspielen';
    card.classList.add('video-hosted');
    action.prepend(btn);

    const vis=card.querySelector('.video-visual');
    const visualPlay=document.createElement('button');
    visualPlay.type='button';
    visualPlay.className='video-art-cta';
    visualPlay.textContent='▶ Video hier ansehen';
    visualPlay.setAttribute('aria-label','Video „'+card.querySelector('h4').textContent+'“ direkt hier abspielen');
    visualPlay.setAttribute('aria-controls',panel.id);
    visualPlay.setAttribute('aria-expanded','false');
    vis.appendChild(visualPlay);

    const close=()=>{
      panel.hidden=true;
      panel.replaceChildren(); // stopping playback: destroys iframe
      btn.textContent='▶ Hier abspielen';
      btn.setAttribute('aria-expanded','false');
      visualPlay.setAttribute('aria-expanded','false');
      visualPlay.textContent='▶ Video hier ansehen';
    };
    const toggle=()=>{
      if(!panel.hidden){close();return;}
      // The iframe is created only on a deliberate click: faster page, no
      // surprise third-party requests, and no broken embed in file:// mode.
      const frame=document.createElement('iframe');
      frame.src='https://www.youtube.com/embed/'+id+'?playsinline=1&rel=0&autoplay=1';
      frame.title='YouTube-Videoplayer: '+card.querySelector('h4').textContent;
      frame.loading='eager';
      frame.referrerPolicy='strict-origin-when-cross-origin';
      frame.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
      frame.setAttribute('allowfullscreen','');
      panel.appendChild(frame);
      const note=document.createElement('div');
      note.className='video-player-note';
      note.append('Falls YouTube die Wiedergabe im Browser sperrt: ');
      const direct=card.querySelector('.video-primary').cloneNode(true);
      direct.textContent='Video direkt auf YouTube öffnen ↗';
      note.appendChild(direct);
      panel.appendChild(note);
      panel.hidden=false;
      btn.textContent='✕ Player schließen';
      btn.setAttribute('aria-expanded','true');
      visualPlay.setAttribute('aria-expanded','true');
      visualPlay.textContent='✕ Player schließen';
    };
    btn.addEventListener('click',toggle);
    visualPlay.addEventListener('click',toggle);
  });
})();



(function(){
 'use strict';
 const details=document.querySelector('#chapter-menu');
 const links=[...document.querySelectorAll('.chapter-picker a, nav.side a, .toolbar-shortcuts a')];
 const chapterIds=['start','k1','k2','k3','k4','k5','k6','k7','gesamtcheck','checkliste'];
 const sections=chapterIds.map(id=>document.getElementById(id)).filter(Boolean);
 const current=document.querySelector('.menu-current');
 const names={start:'Übersicht',k1:'Kapitel 1',k2:'Kapitel 2',k3:'Kapitel 3',k4:'Kapitel 4',k5:'Kapitel 5',k6:'Kapitel 6',k7:'Kapitel 7',gesamtcheck:'Gesamtabfrage',checkliste:'Checkliste'};
 function setCurrent(id){
   current.textContent=names[id]||'Übersicht';
   links.forEach(a=>{if(a.hash==='#'+id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
 }
 let scrollScheduled=false;
 function refresh(){
   scrollScheduled=false;
   let active='start';
   for(const node of sections){if(node.getBoundingClientRect().top<=window.innerHeight*.38)active=node.id;}
   setCurrent(active);
 }
 window.addEventListener('scroll',()=>{if(!scrollScheduled){scrollScheduled=true;requestAnimationFrame(refresh);}}, {passive:true});
 window.addEventListener('resize',refresh);
 window.addEventListener('hashchange',()=>requestAnimationFrame(refresh));
 document.querySelectorAll('.chapter-picker a').forEach(a=>a.addEventListener('click',()=>{details.open=false;setCurrent(a.hash.slice(1));document.getElementById(a.hash.slice(1))?.focus({preventScroll:true});}));
 document.addEventListener('click',e=>{if(details.open&&!details.contains(e.target))details.open=false;});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&details.open){details.open=false;details.querySelector('summary').focus();}});
 // On initial #k3 deep links, the browser may scroll after script evaluation.
 requestAnimationFrame(refresh);
 window.addEventListener('load',refresh);
})();



(function(){
  'use strict';
  try {
    document.querySelectorAll('.quiz').forEach(quiz=>{
      const cards=[...quiz.querySelectorAll('.css-mcq')];
      const box=quiz.querySelector('.quiz-status');
      const count=box?.querySelector('.quiz-score');
      const bar=box?.querySelector('.quiz-progress');
      const reset=box?.querySelector('.quiz-reset');
      if(!box||!count||!bar||!reset||!cards.length)return;
      box.hidden=false;
      reset.hidden=false;
      const update=()=>{
        let answered=0,correct=0;
        cards.forEach(card=>{
          const chosen=card.querySelector('input[type=radio]:checked');
          if(chosen){
            answered++;
            const correctInput=card.querySelectorAll('.quiz-option')[Number(card.dataset.answer)]?.querySelector('input');
            if(chosen===correctInput)correct++;
          }
        });
        count.textContent=answered===cards.length ?
          `${correct} von ${cards.length} richtig · Quiz abgeschlossen` :
          `${answered} von ${cards.length} beantwortet · ${correct} richtig`;
        bar.value=answered;
      };
      quiz.addEventListener('change',event=>{
        if(event.target instanceof HTMLInputElement && event.target.type==='radio')update();
      });
      reset.addEventListener('click',()=>{
        cards.forEach(card=>card.querySelectorAll('input[type=radio]').forEach(input=>{input.checked=false;}));
        update();
      });
      update();
    });
  } catch(err) {
    // Quiz and correctness feedback remain functional with CSS only.
  }
})();
