import {access} from 'node:fs/promises';
for(const file of ['public/index.html','public/admin.html','public/app.js','public/admin.js','public/style.css','netlify/functions/api.mjs'])await access(file);
console.log('Fichiers de publication vérifiés.');
