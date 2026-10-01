import {scryptSync,timingSafeEqual,createHmac} from 'node:crypto';
export function hashPassword(p,salt){return `scrypt:${salt}:${scryptSync(p,salt,64).toString('hex')}`;}
export function checkPassword(p,hash){try{const [kind,salt,h]=hash.split(':');if(kind!=='scrypt'||!salt||h.length!==128)return false;return timingSafeEqual(Buffer.from(h,'hex'),scryptSync(p,salt,64));}catch{return false;}}
const mac=(s,secret)=>createHmac('sha256',secret).update(s).digest('hex');
export function session(secret){const expires=String(Date.now()+8*3600000);return `${expires}.${mac(expires,secret)}`;}
export function verified(value,secret){try{const [exp,sig]=value.split('.');return Number(exp)>Date.now()&&Number(exp)<Date.now()+9*3600000&&sig.length===64&&timingSafeEqual(Buffer.from(sig,'hex'),Buffer.from(mac(exp,secret),'hex'));}catch{return false;}}
export function cookies(req){return Object.fromEntries((req.headers.get('cookie')||'').split(';').filter(x=>x.includes('=')).map(x=>{const i=x.indexOf('=');return [x.slice(0,i).trim(),x.slice(i+1).trim()];}));}
export function cookie(req,name,value,age){return `${name}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${new URL(req.url).protocol==='https:'?'; Secure':''}`;}
