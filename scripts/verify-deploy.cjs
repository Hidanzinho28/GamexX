const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
for(const name of ['index.html','gamex-brasil.html','cart.html','product.html','assets/banner-gamex.png','assets/banner-shop.png','assets/banner-market.png','assets/community.css','assets/live-payment.js']) assert(fs.statSync(path.join(root,'public',name)).isFile(),name);
const css=fs.readFileSync(path.join(root,'public/assets/community.css'),'utf8');
assert(css.includes('.gx-banner-track')&&!css.trimStart().startsWith('(() =>'), 'O arquivo community.css deve conter o estilo correto dos banners.');
assert.equal(Object.keys(require('../lib/catalog.cjs')).length,24);
assert(fs.readFileSync(path.join(root,'public/assets/live-payment.js'),'utf8').includes('gamex-bukio-payment'));
console.log('GameX: páginas, 3 banners, catálogo e integração BukioPay conferidos.');
