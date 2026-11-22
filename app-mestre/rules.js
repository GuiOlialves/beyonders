export const VERSION=1;
export const ATTRS={vit:'Vitalidade',for:'Força',int:'Intelecto',von:'Vontade'};
export const SKILLS=['Atletismo','Luta','Pontaria','Furtividade','Prestidigitação','Prontidão','Investigação','Ocultismo','Medicina','Erudição','Sociedade','Intuição Social','Técnica','Sobrevivência','Expressão','Autocontrole'];
export const PATHS={
 vidente:{name:'Vidente',seq:['Vidente','Palhaço','Mágico'],gains:['int','for','von'],focus:'Adivinhação, percepção espiritual, controle corporal e truques sobrenaturais.'},
 espectador:{name:'Espectador',seq:['Espectador','Telepata','Psiquiatra'],gains:['int','von','int'],focus:'Observação, emoções, leitura de intenções e intervenção sobre a mente.'},
 insone:{name:'Insone',seq:['Insone','Poeta da Meia-Noite','Pesadelo'],gains:['von','vit','von'],focus:'Vigília, escuridão, versos sobrenaturais e sonhos.'},
 cacador:{name:'Caçador',seq:['Caçador','Provocador','Piromaníaco'],gains:['for','int','vit'],focus:'Rastreamento, preparo, provocação e controle de chamas.'},
 guerreiro:{name:'Guerreiro',seq:['Guerreiro','Pugilista','Mestre de Armas'],gains:['for','vit','for'],focus:'Combate, resistência e domínio de armas.'},
 saqueador:{name:'Saqueador',seq:['Saqueador','Trapaceiro','Criptólogo'],gains:['for','von','int'],focus:'Furto, fraude e decifração. Roubar habilidades não está disponível nas Sequências 9 a 7.'}
};
export const CONDITIONS={Abalado:'−1 em testes.',Exposto:'DF −2 até o próximo ataque físico pertinente ou fim do próximo turno.',Caído:'Ataques corpo a corpo +2; disparos além de 10 m −2. Levantar custa metade do movimento.',Agarrado:'Movimento 0; escapar exige ação.',Sangrando:'Perde 1 de Vida no fim de cada turno.', 'Em chamas':'1d6 de Vida ao fim do turno; apagar exige ação.',Inconsciente:'Sem ações ou reações.',Amedrontado:'−2 contra a fonte; não se aproxima voluntariamente.',Desorientado:'Desvantagem em Prontidão e ataques.',Cego:'DF −2; não escolhe alvos só pela visão.',Preparado:'+2 no teste relacionado à preparação.',Inspirado:'+1 em Autocontrole.',Acelerado:'+4 m de movimento.',Protegido:'Redução indicada pela fonte.',Oculto:'Não é alvo direto de quem não o localizou.',Concentrado:'+2 no próximo teste da tarefa; perde ao sofrer dano.',Estabilizado:'Não faz testes de morte; novo dano encerra.'};
export const WEAPONS=[
 ['Punhos','1d4',true,0,0,0],['Adaga','1d6',true,10,0,0],['Espada','1d8',true,0,0,0],['Arma pesada','1d10',true,0,0,0],['Arco','1d6+2',false,30,0,0],['Besta','1d10+2',false,30,1,1],['Revólver de serviço','2d6',false,30,6,3],['Revólver pesado','2d8',false,30,6,3],['Rifle','2d10',false,100,5,5],['Escopeta','3d6',false,10,2,2]
];
export const uid=()=>globalThis.crypto?.randomUUID?.()||`id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const num=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,num(v)));
export const skill=(c,k)=>num(c.skills[k]);
export function derived(c){
 const a=c.attrs,g=10-c.sequence,m=c.adjust;
 const hp=Math.max(1,10+4*a.vit+2*g+num(m.hp));
 const spirit=Math.max(1,10+3*a.von+2*a.int+5*g+num(m.spirit));
 const armor=Math.max(0,...c.items.filter(i=>i.equipped&&i.qty>0).map(i=>num(i.armor)));
 const weight=c.items.reduce((s,i)=>s+Math.max(0,num(i.qty))*Math.max(0,num(i.spaces)),0);
 return {grade:g,hp,san:100,spirit,rm:Math.max(0,Math.floor(a.von/2)+g-1+num(m.rm)),df:7+a.for+skill(c,'Luta')+num(m.df),dm:7+a.von+skill(c,'Autocontrole')+num(m.dm),initiative:a.int+skill(c,'Prontidão'),threshold:Math.ceil(spirit/3),capacity:6+2*a.for,weight,armor:armor+Math.max(0,num(m.armor)),skillCap:12-c.sequence};
}
export function reconcile(c){const d=derived(c);for(const k of ['hp','san','spirit'])c.resources[k]=clamp(c.resources[k],0,d[k]);c.fatigue=clamp(c.fatigue,0,3);c.corruption=clamp(c.corruption,0,6);if(c.resources.spirit===0)c.fatigue=Math.max(2,c.fatigue);return d;}
export function createCharacter(name='Novo personagem',path='vidente',demo=false){
 const c={id:uid(),name,path,sequence:9,attrs:{vit:2,for:2,int:2,von:2},skills:Object.fromEntries(SKILLS.map(k=>[k,0])),resources:{hp:0,san:100,spirit:0},adjust:{hp:0,spirit:0,df:0,dm:0,rm:0,armor:0},identity:{player:'',occupation:'',origin:'',age:'',appearance:'',motive:'',faction:'',anchors:'',contact:'',debt:'',bond:''},xp:0,digestion:0,corruption:0,fatigue:0,deathFails:0,conditions:[],wounds:'',abilities:[],items:[],money:{pounds:10,shillings:0,pence:0},notes:{background:'',principles:'',investigation:'',clues:'',hypotheses:'',contacts:'',traumas:'',session:'',custom:'',clock:0},log:[],overloadUsed:false};
 c.attrs[PATHS[path].gains[0]]++;
 if(demo){c.name='Helena Ward';c.attrs={vit:2,for:1,int:4,von:2};Object.assign(c.skills,{'Investigação':3,'Ocultismo':3,'Prontidão':2,'Autocontrole':2,'Sociedade':1,'Medicina':1});c.identity.occupation='Auxiliar de arquivo';c.identity.origin='Loen';c.identity.anchors='As cartas da irmã; o compromisso de voltar para casa.';c.identity.motive='Descobrir o que aconteceu com um pesquisador desaparecido.';c.notes.principles='Interprete o papel sem abandonar sua identidade.';c.items=[{id:uid(),name:'Revólver de serviço',type:'Arma',qty:1,spaces:1,armor:0,equipped:true,damage:'2d6',addForce:false,range:30,ammo:6,capacity:6,reload:3,notes:'Exemplo: registre e desconte os cartuchos disparados.'},{id:uid(),name:'Kit de primeiros socorros',type:'Equipamento',qty:1,spaces:1,armor:0,equipped:false,notes:'Material para Medicina.'}];}
 let d=derived(c);c.resources.hp=d.hp;c.resources.spirit=d.spirit;
 return c;
}
export function fatigue(c){if(c.fatigue>=3)return 'Inconsciente por 1d6 rodadas; mantenha Fadiga III.';c.fatigue++;return `Fadiga ${c.fatigue}.`;}
export function spendSpirit(c,cost,{overload=false}={}){
 cost=Math.max(0,Math.trunc(num(cost)));const d=derived(c),missing=Math.max(0,cost-c.resources.spirit);
 if(missing&&(!overload||c.overloadUsed))throw Error(c.overloadUsed?'Sobrecarga já usada nesta cena.':'Espiritualidade insuficiente.');
 if(missing&&(c.resources.hp<=2*missing||c.resources.san<=3*missing))throw Error('A sobrecarga deve deixar Vida e Sanidade acima de zero.');
 if(missing){c.resources.hp-=2*missing;c.resources.san-=3*missing;c.overloadUsed=true;}
 c.resources.spirit=Math.max(0,c.resources.spirit-cost);
 const generated=cost>=d.threshold||missing>0;
 const message=generated?fatigue(c):'Sem fadiga por gasto concentrado.';
 reconcile(c);return {cost,missing,generated,message};
}
export function damage(c,amount,kind='physical',reduce=true){
 const d=derived(c);amount=Math.max(0,Math.trunc(num(amount)));
 const final=kind==='san'?amount===0?0:Math.max(1,amount-(reduce?d.rm:0)):Math.max(0,amount-(reduce?d.armor:0));
 const key=kind==='san'?'san':'hp',before=c.resources[key];c.resources[key]=Math.max(0,before-final);
 const result={final,grave:kind==='physical'&&final>=Math.ceil(d.hp/2),instantDeath:kind==='physical'&&before>0&&c.resources.hp===0&&final>=d.hp,crisis:false};
 if(kind==='san'){result.crisis=final>=15||(before>50&&c.resources.san<=50)||(before>20&&c.resources.san<=20)||(c.resources.san<=20&&final>0);}
 else if(before===0&&final>0)c.deathFails=Math.min(2,c.deathFails+1);
 return result;
}
export function rest(c,type,roll=1){const d=derived(c);let msg='';
 if(type==='short'){c.fatigue=Math.max(0,c.fatigue-1);msg='20 min: removida 1 fadiga.';}
 if(type==='hour'){c.resources.spirit=Math.min(d.spirit,c.resources.spirit+Math.ceil(d.spirit/4));msg='1 h: recuperou ¼ da Espiritualidade máxima (para cima). Limite: uma vez a cada 4 h.';}
 if(type==='night'){c.resources.spirit=d.spirit;c.resources.hp=Math.min(d.hp,c.resources.hp+c.attrs.vit+2);c.fatigue=0;msg='8 h seguras: Espiritualidade cheia, recuperação diária de Vida e fadiga removida pelo repouso. Limite: uma vez a cada 24 h.';}
 if(type==='anchor'){c.resources.san=Math.min(100,c.resources.san+clamp(roll,1,4));msg='Noite segura com Âncora pessoal: +1d4 de Sanidade, uma vez/dia. Não recupera perdas vinculadas a uma fonte ativa.';}
 reconcile(c);return msg;
}
export function advance(c,free){
 if(c.sequence<=7)throw Error('Esta versão cobre somente as Sequências 9, 8 e 7.');
 if(c.digestion<8||c.resources.san<70||c.corruption>1)throw Error('Avanço seguro exige digestão 8/8, Sanidade 70+ e Corrupção 0–1.');
 const index=10-c.sequence,required=PATHS[c.path].gains[index];
 const forced=c.attrs[required]<5?required:Object.keys(ATTRS).find(k=>k!==free&&c.attrs[k]<5);
 if(!forced||free===forced||!Object.hasOwn(ATTRS,free)||c.attrs[free]>=5)throw Error('Escolha um atributo livre diferente do obrigatório e abaixo de 5.');
 c.attrs[forced]++;c.attrs[free]++;c.sequence--;c.digestion=0;reconcile(c);
 return `Avançou: +1 ${ATTRS[forced]}, +1 ${ATTRS[free]}. Distribua 2 pontos de perícia; máximos recalculados, sem cura.`;
}
export function classifyAttack(dice,bonus,defense){const total=dice.reduce((a,b)=>a+b,0)+num(bonus),margin=total-num(defense),fumble=dice.every(v=>v===1),hit=!fumble&&margin>=0;return {total,margin,fumble,hit,critical:hit&&(dice.every(v=>v===6)||margin>=8),extra:hit&&margin>=5?2:0};}
export function rollD6(mode='normal',random=Math.random){const dice=Array.from({length:mode==='normal'?2:3},()=>1+Math.floor(random()*6));let kept=[...dice];if(mode!=='normal'){kept.sort((a,b)=>a-b);kept=mode==='advantage'?kept.slice(-2):kept.slice(0,2);}return {dice,kept};}
export function rollDamage(expression,critical=false,random=Math.random){
 expression=String(expression).toLowerCase().replace(/\s/g,'');
 if(!/^(?:\d{1,2}d(?:4|6|8|10|12|20)|\d{1,3})(?:[+-]\d{1,3})?$/.test(expression))throw Error('Use dano como 2d6, 1d8+2 ou 4.');
 const match=expression.match(/^(\d+)d(\d+)([+-]\d+)?$/);let dice=[],fixed=0;
 if(match){let count=+match[1],faces=+match[2];if(count>20)throw Error('Máximo 20 dados.');if(critical)count++;dice=Array.from({length:count},()=>1+Math.floor(random()*faces));fixed=num(match[3]);}
 else{const fixedMatch=expression.match(/^(\d+)([+-]\d+)?$/);fixed=+fixedMatch[1]+num(fixedMatch[2])+(critical?3:0);}
 return {dice,fixed,total:Math.max(0,dice.reduce((a,b)=>a+b,0)+fixed)};
}
const plain=(v)=>v&&typeof v==='object'&&!Array.isArray(v);
export function normalize(raw){
 if(!plain(raw))throw Error('Ficha inválida.');
 const path=Object.hasOwn(PATHS,raw.path)?raw.path:'vidente';const c=createCharacter(String(raw.name||'Personagem importado').slice(0,120),path);
 c.id=typeof raw.id==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(raw.id)?raw.id:uid();c.sequence=clamp(Math.round(num(raw.sequence,9)),7,9);
 for(const k of Object.keys(ATTRS))c.attrs[k]=clamp(Math.trunc(num(raw.attrs?.[k],2)),0,5);
 for(const k of SKILLS)c.skills[k]=clamp(Math.trunc(num(raw.skills?.[k])),0,12-c.sequence);
 for(const k of Object.keys(c.adjust))c.adjust[k]=clamp(Math.trunc(num(raw.adjust?.[k])),-100,100);
 for(const k of ['identity','notes'])for(const field of Object.keys(c[k]))c[k][field]=field==='clock'?clamp(raw[k]?.[field],0,6):String(raw[k]?.[field]||'').slice(0,30000);
 for(const k of ['hp','san','spirit'])c.resources[k]=Math.max(0,num(raw.resources?.[k],derived(c)[k]));
 for(const k of ['xp','digestion','corruption','fatigue','deathFails'])c[k]=clamp(raw[k],0,k==='digestion'?8:k==='corruption'?6:k==='fatigue'?3:k==='deathFails'?2:9999);
 c.overloadUsed=Boolean(raw.overloadUsed);c.wounds=String(raw.wounds||'').slice(0,30000);
 c.conditions=Array.isArray(raw.conditions)?raw.conditions.filter(v=>Object.hasOwn(CONDITIONS,v)):[];
 c.log=Array.isArray(raw.log)?raw.log.slice(-100).map(v=>({at:String(v.at||''),text:String(v.text||'').slice(0,2000)})):[];
 for(const k of Object.keys(c.money))c.money[k]=clamp(raw.money?.[k],0,999999);
 c.abilities=(Array.isArray(raw.abilities)?raw.abilities:[]).slice(0,250).filter(plain).map(v=>({id:uid(),name:String(v.name||'Habilidade').slice(0,160),cost:clamp(v.cost,0,999),sequence:clamp(num(v.sequence,9),7,9),test:String(v.test||'').slice(0,200),range:String(v.range||'').slice(0,200),duration:String(v.duration||'').slice(0,200),notes:String(v.notes||'').slice(0,20000)}));
 c.items=(Array.isArray(raw.items)?raw.items:[]).slice(0,500).filter(plain).map(v=>({id:uid(),name:String(v.name||'Item').slice(0,160),type:String(v.type||'Equipamento').slice(0,80),qty:clamp(v.qty,0,9999),spaces:clamp(v.spaces,0,999),armor:clamp(v.armor,0,99),equipped:Boolean(v.equipped),damage:String(v.damage||'').slice(0,80),addForce:Boolean(v.addForce),range:clamp(v.range,0,9999),ammo:clamp(v.ammo,0,9999),capacity:clamp(v.capacity,0,9999),reload:clamp(v.reload,0,9999),notes:String(v.notes||'').slice(0,20000)}));
 reconcile(c);return c;
}
export function parseBackup(text){
 if(text.length>5000000)throw Error('Arquivo muito grande (máximo 5 MB).');
 const data=JSON.parse(text);if(data.version!==VERSION)throw Error('Formato de backup incompatível.');
 if(!Array.isArray(data.characters)||!data.characters.length||data.characters.length>100)throw Error('O backup precisa conter entre 1 e 100 fichas.');
 return data.characters.map(normalize);
}
