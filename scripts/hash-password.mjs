import {randomBytes,scryptSync} from 'node:crypto';
import readline from 'node:readline';
const rl=readline.createInterface({input:process.stdin,output:process.stdout});
rl.question('Mot de passe administrateur (visible ici ; 12 caractères minimum) : ',p=>{rl.close();if(p.length<12){console.error('Choisissez au moins 12 caractères.');process.exitCode=1;return;}const salt=randomBytes(16).toString('hex');console.log('\nADMIN_PASSWORD_HASH = scrypt:'+salt+':'+scryptSync(p,salt,64).toString('hex'));console.log('\nSESSION_SECRET = '+randomBytes(32).toString('hex'));});
