import {$,api,node,toast} from './shared.js';
let state,working=false;
function show(s){state=s;$('login').hidden=!!s.admin;$('dashboard').hidden=!s.admin;$('logout').hidden=!s.admin;if(!s.admin)return;for(const k of ['title','description','cta'])$(k).value=s[k];$('closed').checked=s.closed;$('summary').textContent=s.total+' votes · '+s.candidates.length+' réponses · '+(s.closed?'Clôturé':'Ouvert');$('answers').replaceChildren();if(!s.candidates.length)$('answers').append(node('p','Aucune réponse pour le moment.','muted'));for(const c of s.candidates){const row=node('div',undefined,'admin-row');row.append(node('span',c.name+' — '+c.votes+' vote'+(c.votes>1?'s':'')));const b=node('button','Supprimer','danger');b.type='button';b.onclick=()=>{if(confirm('Supprimer « '+c.name+' » et ses '+c.votes+' votes ? Cette action est définitive.'))run(async()=>{await api('delete',{id:c.id,...version()});await load();toast('Réponse supprimée');});};row.append(b);$('answers').append(row);}}
const version=()=>({epoch:state.epoch,revision:state.revision});
async function load(){show(await api());}
async function run(fn){if(working)return;working=true;$('admin-error').textContent='';for(const b of document.querySelectorAll('button'))b.disabled=true;try{await fn();}catch(e){$('admin-error').textContent=e.message;if(e.status===401){$('login').hidden=false;$('dashboard').hidden=true;$('logout').hidden=true;}}finally{working=false;for(const b of document.querySelectorAll('button'))b.disabled=false;}}
$('login').onsubmit=e=>{e.preventDefault();run(async()=>{await api('login',{password:$('password').value});$('password').value='';await load();toast('Connexion réussie');});};
$('logout').onclick=()=>run(async()=>{await api('logout',{});await load();});
$('settings').onsubmit=e=>{e.preventDefault();run(async()=>{await api('settings',{...version(),title:$('title').value,description:$('description').value,cta:$('cta').value,closed:$('closed').checked});await load();toast('Paramètres enregistrés');});};
$('reload').onclick=()=>{if(confirm('Actualiser et abandonner les modifications non enregistrées ?'))run(load);};
$('reset').onclick=()=>{if(prompt('Cette action supprime tous les votes. Tapez REMETTRE À ZÉRO pour confirmer.')==='REMETTRE À ZÉRO')run(async()=>{await api('reset',version());await load();toast('Consultation réinitialisée');});};
run(load);
