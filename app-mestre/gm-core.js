import {uid,num,clamp,derived,createCharacter,normalize,parseBackup as parsePlayer,rollD6,rollDamage,classifyAttack,SKILLS,CONDITIONS,PATHS} from './rules.js';
import {SEED} from './seed.js';
export {uid,SKILLS,CONDITIONS,PATHS,rollD6,rollDamage};
export const APP='arquivo-beyonder-mestre';
export const clone=v=>JSON.parse(JSON.stringify(v));
const str=(v,n=30000)=>String(v??'').slice(0,n);
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v);
const id=v=>typeof v==='string'&&/^[\w-]{1,100}$/.test(v)&&!['__proto__','constructor','prototype'].includes(v)?v:uid();
export function stats(e){
 if(e.mode==='auto')return {...derived(e),move:e.fatigue>=3?4:8};
 return {...e.stats,san:100,threshold:Math.ceil(e.stats.spirit/3)};
}
export function reconcile(e){
 const d=stats(e);
 for(const k of ['hp','san','spirit'])e.resources[k]=d[k]===null?Math.max(0,num(e.resources[k])):clamp(e.resources[k],0,d[k]);
 e.fatigue=clamp(e.fatigue,0,3);e.corruption=clamp(e.corruption,0,6);
 if(d.spirit>0&&e.resources.spirit===0)e.fatigue=Math.max(2,e.fatigue);
 return e;
}
export function createEntity(name='Novo NPC',mode='simple'){
 const base=clone(SEED.entities[0]);
 Object.assign(base,{id:uid(),name,role:'neutral',mode,path:'vidente',sequence:9,stats:{hp:12,san:100,spirit:0,df:9,dm:9,initiative:2,rm:0,armor:0,move:8},resources:{hp:12,san:100,spirit:0},conditions:[],attacks:[],abilities:[],items:[],source:'',faction:'',location:'',motive:'',fear:'',secret:'',knowledge:'',quote:'',tactics:'',morale:'',loot:'',notes:'',markChecks:0,corruption:0,fatigue:0,deathFails:0,dead:false});
 if(mode==='auto'){const c=createCharacter(name);Object.assign(base,c,{role:'neutral',mode:'auto',notes:''});}
 if(mode==='narrative'){base.stats.hp=null;base.stats.df=null;base.stats.dm=null;base.resources.hp=0;}
 return base;
}
export function newSession(name='Sessão 1 · A segunda voz',prepared=true){
 return {id:uid(),name,date:new Date().toISOString().slice(0,10),scene:SEED.scenes[0].id,notes:'',clocks:prepared?clone(SEED.clocks):[],clues:prepared?clone(SEED.clues):[],checklist:[],combat:{active:false,round:1,index:0,participants:[],note:''},log:[]};
}
export function createState(){const s=newSession();return {version:1,entities:clone(SEED.entities),sessions:[s],activeSession:s.id,customNotes:[]};}
export const session=s=>s.sessions.find(v=>v.id===s.activeSession)||s.sessions[0];
export const entity=(s,id)=>s.entities.find(e=>e.id===id);
export function record(s,text){const a=session(s);a.log.push({id:uid(),at:new Date().toISOString(),text:str(text,3000)});a.log=a.log.slice(-500);}
export function normalizeAttack(a){return {id:id(a.id),name:str(a.name||'Ataque',160),bonus:clamp(a.bonus,-99,99),damage:str(a.damage||'1d6',40),kind:a.kind==='san'?'san':'physical',range:str(a.range,120),cost:clamp(Math.trunc(num(a.cost)),0,999),usesAmmo:!!a.usesAmmo,ammo:clamp(Math.trunc(num(a.ammo)),0,9999),capacity:clamp(Math.trunc(num(a.capacity)),0,9999),reserve:clamp(Math.trunc(num(a.reserve)),0,9999),reload:clamp(Math.trunc(num(a.reload)),0,999),notes:str(a.notes,5000)};}
export function normalizeEntity(raw){
 if(!obj(raw))throw Error('Ficha de NPC inválida.');
 const mode=['auto','simple','narrative'].includes(raw.mode)?raw.mode:'simple';
 const e=createEntity(str(raw.name||'NPC',120),mode);
 if(mode==='auto')Object.assign(e,normalize(raw),{mode});
 e.id=id(raw.id);e.role=['ally','adversary','neutral','player'].includes(raw.role)?raw.role:'neutral';
 for(const k of ['name','faction','location','motive','fear','secret','knowledge','quote','tactics','morale','loot','notes','wounds','source'])e[k]=str(raw[k],k==='name'?120:30000);
 for(const k of ['hp','spirit','df','dm','initiative','rm','armor','move'])e.stats[k]=raw.stats?.[k]===null&&['hp','df','dm'].includes(k)?null:clamp(raw.stats?.[k],k==='initiative'?-99:0,9999);
 e.stats.san=100;
 for(const k of ['hp','san','spirit'])e.resources[k]=Math.max(0,num(raw.resources?.[k],k==='san'?100:0));
 for(const k of ['vit','for','int','von'])e.attrs[k]=clamp(Math.trunc(num(raw.attrs?.[k],2)),0,5);
 e.skills=Object.fromEntries(SKILLS.map(k=>[k,clamp(raw.skills?.[k],0,mode==='auto'?12-e.sequence:12)]));
 e.attacks=(Array.isArray(raw.attacks)?raw.attacks:[]).slice(0,60).filter(obj).map(normalizeAttack);
 e.abilities=(Array.isArray(raw.abilities)?raw.abilities:[]).slice(0,100).filter(obj).map(a=>({id:id(a.id),name:str(a.name,160),cost:clamp(a.cost,0,999),notes:str(a.notes,20000)}));
 e.items=(Array.isArray(raw.items)?raw.items:[]).slice(0,200).filter(obj).map(a=>({id:id(a.id),name:str(a.name,160),qty:clamp(a.qty,0,9999),spaces:clamp(a.spaces,0,999),armor:clamp(a.armor,0,99),equipped:!!a.equipped,notes:str(a.notes,10000)}));
 e.conditions=Array.isArray(raw.conditions)?[...new Set(raw.conditions.filter(v=>Object.hasOwn(CONDITIONS,v)))]:[];
 e.corruption=clamp(Math.trunc(num(raw.corruption)),0,6);e.fatigue=clamp(Math.trunc(num(raw.fatigue)),0,3);e.deathFails=clamp(raw.deathFails,0,2);e.markChecks=clamp(raw.markChecks,0,99);e.overloadUsed=!!raw.overloadUsed;e.dead=!!raw.dead;
 return reconcile(e);
}
function normalizeSession(raw,entityIds){
 if(!obj(raw))throw Error('Sessão inválida.');const s=newSession(str(raw.name||'Sessão',160),false);s.id=id(raw.id);s.date=str(raw.date,20);s.scene=str(raw.scene,120);s.notes=str(raw.notes,100000);
 s.checklist=Array.isArray(raw.checklist)?raw.checklist.slice(0,60).map(v=>str(v,120)):[];
 s.clocks=(Array.isArray(raw.clocks)?raw.clocks:[]).slice(0,40).filter(obj).map(v=>({id:id(v.id),name:str(v.name,120),max:clamp(Math.trunc(num(v.max,6)),1,24),value:clamp(Math.trunc(num(v.value)),0,clamp(v.max,1,24)),note:str(v.note,3000)}));
 s.clues=(Array.isArray(raw.clues)?raw.clues:[]).slice(0,200).filter(obj).map(v=>({id:id(v.id),title:str(v.title,160),summary:str(v.summary,10000),handout:str(v.handout,120),sources:Array.isArray(v.sources)?v.sources.slice(0,20).map(x=>str(x,100)):[],conclusions:Array.isArray(v.conclusions)?v.conclusions.filter(x=>['A','B','C','D'].includes(x)):[],found:!!v.found,shared:!!v.shared,notes:str(v.notes,20000)}));
 s.log=(Array.isArray(raw.log)?raw.log:[]).slice(-500).filter(obj).map(v=>({id:id(v.id),at:str(v.at,60),text:str(v.text,3000)}));
 const c=obj(raw.combat)?raw.combat:{};s.combat={active:!!c.active,round:clamp(c.round||1,1,999),index:0,note:str(c.note,10000),participants:[]};
 const seen=new Set();for(const p of (Array.isArray(c.participants)?c.participants:[]).slice(0,50)){if(!obj(p)||!entityIds.has(p.entityId)||seen.has(p.entityId))continue;seen.add(p.entityId);s.combat.participants.push({id:id(p.id),entityId:p.entityId,initiative:num(p.initiative),action:!!p.action,reaction:!!p.reaction});}
 s.combat.index=Math.trunc(clamp(c.index,0,Math.max(0,s.combat.participants.length-1)));
 return s;
}
export function parseBackup(text){
 if(text.length>5000000)throw Error('Backup excede 5 MB.');const v=JSON.parse(text);
 if(v.app!==APP||v.version!==1||!obj(v.data)||!Array.isArray(v.data.entities)||!Array.isArray(v.data.sessions)||!v.data.sessions.length)throw Error('Este não é um backup do Arquivo Beyonder — Mestre.');
 if(v.data.entities.length>300||v.data.sessions.length>50)throw Error('Limite: 300 fichas e 50 sessões.');
 const entities=v.data.entities.map(normalizeEntity),ids=new Set(entities.map(v=>v.id));if(ids.size!==entities.length)throw Error('Há fichas com IDs duplicados.');
 const sessions=v.data.sessions.map(s=>normalizeSession(s,ids));if(new Set(sessions.map(s=>s.id)).size!==sessions.length)throw Error('Há sessões duplicadas.');
 return {version:1,entities,sessions,activeSession:sessions.some(s=>s.id===v.data.activeSession)?v.data.activeSession:sessions[0].id,customNotes:(Array.isArray(v.data.customNotes)?v.data.customNotes:[]).slice(0,150).filter(obj).map(v=>({id:id(v.id),title:str(v.title,160),body:str(v.body,100000)}))};
}
export function backup(s){return JSON.stringify({app:APP,version:1,exportedAt:new Date().toISOString(),data:s},null,2);}
export function importPlayers(text){return parsePlayer(text).map(c=>{
 const e=createEntity(c.name,'auto');Object.assign(e,c,{id:uid(),mode:'auto',role:'player'});
 const labels={background:'Histórico',principles:'Princípios de atuação',investigation:'Investigação',clues:'Pistas',hypotheses:'Hipóteses',contacts:'Contatos',traumas:'Traumas',session:'Anotações da sessão',custom:'Outras notas'};e.notes=Object.entries(labels).filter(([k])=>c.notes?.[k]).map(([k,v])=>v+':\n'+c.notes[k]).join('\n\n');const identity=Object.entries(c.identity).filter(([,v])=>v).map(([k,v])=>k+': '+v).join('\n');if(identity)e.notes+='\n\nIdentidade importada:\n'+identity;for(const a of e.abilities)a.notes=[a.test?'Teste: '+a.test:'',a.range?'Alcance: '+a.range:'',a.duration?'Duração: '+a.duration:'',a.notes].filter(Boolean).join('\n');e.motive=c.identity.motive;e.faction=c.identity.faction;e.secret='';e.location=c.identity.origin;e.knowledge=c.identity.occupation;e.quote='';e.source='';e.attacks=[];
 for(const w of c.items.filter(i=>i.damage&&i.qty>0)){const b=w.addForce?c.attrs.for+num(c.skills.Luta):c.attrs.for+num(c.skills.Pontaria);e.attacks.push(normalizeAttack({name:w.name,bonus:b,damage:w.damage+(w.addForce&&c.attrs.for?`+${c.attrs.for}`:''),range:w.range?`${w.range} m`:'contato',usesAmmo:w.capacity>0,ammo:w.ammo,capacity:w.capacity,reload:w.reload,reserve:0,notes:'Importado: confira o dano com Força. A ficha original não é alterada.'}));
 // Combine two fixed suffixes into one accepted dice expression.
 const a=e.attacks.at(-1);a.damage=a.damage.replace(/([+-]\d+)\+(\d+)$/,(_,x,y)=>{const n=+x+(+y);return n<0?String(n):`+${n}`;});}
 return reconcile(e);
});}
export function applyDamage(e,amount,kind='physical',reduce=true){
 const d=stats(e);if(kind==='physical'&&d.hp===null)throw Error('Defina a Vida máxima desta ficha antes de aplicar dano.');
 amount=Math.max(0,Math.trunc(num(amount)));const dealt=kind==='san'?(amount?Math.max(1,amount-(reduce?d.rm:0)):0):Math.max(0,amount-(reduce?d.armor:0));
 const key=kind==='san'?'san':'hp',before=e.resources[key];e.resources[key]=Math.max(0,before-dealt);
 const grave=kind==='physical'&&dealt>=Math.ceil(d.hp/2)&&dealt>0;
 const fatal=kind==='physical'&&before>0&&e.resources.hp===0&&dealt>=d.hp;
 if(kind==='physical'&&before===0&&dealt>0){e.deathFails=Math.min(2,e.deathFails+1);e.conditions=e.conditions.filter(c=>c!=='Estabilizado');}
 if(fatal||e.deathFails>=2)e.dead=true;
 if(kind==='physical'&&e.resources.hp===0&&!e.conditions.includes('Inconsciente'))e.conditions.push('Inconsciente');
 if(grave)e.wounds+=(e.wounds?'\n':'')+`Ferimento grave: impacto de ${dealt}. Defina efeito e tratamento.`;
 const crisis=kind==='san'&&(dealt>=15||(before>50&&e.resources.san<=50)||(before>20&&e.resources.san<=20)||(e.resources.san<=20&&dealt>0));
 return {dealt,before,after:e.resources[key],grave,fatal,crisis,mark:kind==='san'&&dealt>=10&&e.markChecks<2,breakdown:kind==='san'&&e.resources.san===0};
}
export function spend(e,cost){
 cost=Math.max(0,Math.trunc(num(cost)));const d=stats(e);if(cost>e.resources.spirit)throw Error('Espiritualidade insuficiente. Resolva eventual sobrecarga separadamente.');
 e.resources.spirit-=cost;const generated=cost>0&&d.spirit>0&&cost>=Math.ceil(d.spirit/3);if(generated)e.fatigue=Math.min(3,e.fatigue+1);reconcile(e);return {cost,generated};
}
export function penalty(e){return Math.min(4,e.fatigue+(e.conditions.includes('Abalado')?1:0));}
export function mentalCheck(e,kind='mark',random=Math.random){
 if(kind==='mark'&&e.markChecks>=2)throw Error('Limite de 2 episódios de marca nesta sessão.');
 const r=rollD6('normal',random),dc=e.resources.san<=20?12:9,total=r.kept.reduce((a,b)=>a+b,0)+e.attrs.von+num(e.skills.Autocontrole)-penalty(e),failed=total<dc;
 if(kind==='mark'){e.markChecks++;if(failed)e.corruption=Math.min(6,e.corruption+1);}
 if(kind==='crisis'&&failed&&!e.conditions.includes('Abalado'))e.conditions.push('Abalado');
 return {total,dc,failed,dice:r.kept};
}
export function deathCheck(e,random=Math.random){
 if(e.resources.hp>0||e.dead||e.conditions.includes('Estabilizado'))throw Error('Teste só ocorre com Vida 0, sem estabilização e antes da morte.');
 const r=rollD6('normal',random),total=r.kept.reduce((a,b)=>a+b,0)+e.attrs.vit-penalty(e),fails=r.kept.every(v=>v===1)?2:total<7?1:0;e.deathFails=Math.min(2,e.deathFails+fails);if(e.deathFails>=2)e.dead=true;return {total,fails,dice:r.kept};
}
export function addParticipant(s,entityId){const c=session(s).combat;if(!entity(s,entityId))throw Error('Ficha não encontrada.');if(c.participants.some(p=>p.entityId===entityId))throw Error('Ficha já está no encontro. Duplique para representar outro adversário.');c.participants.push({id:uid(),entityId,initiative:stats(entity(s,entityId)).initiative,action:false,reaction:false});}
export function startEncounter(s,templateId){
 const template=SEED.encounters.find(t=>t.id===templateId);if(!template)throw Error('Encontro não encontrado.');const c=session(s).combat;Object.assign(c,{active:true,round:1,index:0,participants:[],note:template.note});
 for(const e of s.entities.filter(e=>e.role==='player'))addParticipant(s,e.id);for(const id of template.ids)addParticipant(s,id);
}
export function rollInitiative(s,random=Math.random){const c=session(s).combat;for(const p of c.participants){const e=entity(s,p.entityId);p.initiative=rollD6('normal',random).kept.reduce((a,b)=>a+b,0)+stats(e).initiative-penalty(e);}c.participants.sort((a,b)=>b.initiative-a.initiative);c.index=0;c.round=1;c.active=true;for(const p of c.participants){p.action=false;p.reaction=false;}}
export function nextTurn(s){const c=session(s).combat;if(!c.participants.length)throw Error('Adicione participantes.');c.index++;if(c.index>=c.participants.length){c.index=0;c.round++;}const p=c.participants[c.index];p.action=false;p.reaction=false;return entity(s,p.entityId);}
export function attack(s,attackerId,targetId,attackIndex,opts={},random=Math.random){
 const a=entity(s,attackerId),t=entity(s,targetId);if(!a||!t||a===t)throw Error('Escolha atacante e alvo diferentes.');
 const w=a.attacks[attackIndex];if(!w)throw Error('Escolha um ataque da ficha.');
 if(a.dead||a.conditions.includes('Inconsciente'))throw Error('Atacante inconsciente ou morto.');
 if(t.dead)throw Error('O alvo já está morto.');
 const ap=session(s).combat.participants.find(p=>p.entityId===a.id),tp=session(s).combat.participants.find(p=>p.entityId===t.id);
 if(ap?.action)throw Error('A ação deste atacante já foi usada. Renove no turno ou desmarque manualmente.');
 if(w.usesAmmo&&w.ammo<1)throw Error('Sem munição carregada.');if(w.cost>a.resources.spirit)throw Error('Espiritualidade insuficiente.');
 const d=stats(t),key=w.kind==='san'?'dm':'df';if(d[key]===null)throw Error('Preencha a defesa do alvo.');if(w.kind!=='san'&&d.hp===null)throw Error('Preencha a Vida máxima do alvo.');
 if(opts.cover==='total'&&w.kind!=='san')throw Error('Cobertura total impede ataque físico direto.');
 if(opts.reaction&&(w.kind==='san'||!tp||tp.reaction||t.conditions.includes('Inconsciente')))throw Error('Reação indisponível ou inaplicável.');
 // Validate damage before any mutation or dice roll.
 rollDamage(w.damage,false,()=>0);
 const defmods=(opts.cover==='half'&&w.kind!=='san'?2:0)+(opts.reaction?2:0)-(t.fatigue>=3?2:0)-(w.kind!=='san'&&(t.conditions.includes('Exposto')||t.conditions.includes('Cego'))?2:0);
 const defense=d[key]+clamp(defmods,-4,4),context=clamp(num(opts.modifier)-penalty(a),-4,4),bonus=w.bonus+context;
 let mode=opts.mode||'normal';if(a.conditions.includes('Desorientado'))mode='disadvantage';
 const dice=rollD6(mode,random),result=classifyAttack(dice.kept,bonus,defense);
 if(w.usesAmmo)w.ammo--;if(w.cost)spend(a,w.cost);if(ap)ap.action=true;if(opts.reaction)tp.reaction=true;
 if(result.fumble&&!a.conditions.includes('Exposto'))a.conditions.push('Exposto');
 if(w.kind!=='san')t.conditions=t.conditions.filter(c=>c!=='Exposto');
 let damage=null,rolled=null;if(result.hit){rolled=rollDamage(w.damage,result.critical,random);damage=applyDamage(t,rolled.total+result.extra,w.kind,true);}
 return {...result,dice:dice.dice,kept:dice.kept,bonus,defense,rolled,damage,attacker:a.name,target:t.name,weapon:w.name,kind:w.kind,cost:w.cost};
}
export function reload(e,index){const w=e.attacks[index];if(!w?.usesAmmo)throw Error('Esse ataque não usa munição.');const n=Math.min(w.reload,w.capacity-w.ammo,w.reserve);if(n<=0)throw Error('Sem reserva ou arma já carregada.');w.ammo+=n;w.reserve-=n;return n;}
