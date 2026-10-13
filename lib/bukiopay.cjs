'use strict';
const crypto = require('node:crypto');
const catalog = require('./catalog.cjs');
const states = Object.freeze({pending:'PENDING',paid:'COMPLETED',expired:'CANCELED',refunded:'REVERSED'});
class PaymentError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const invalid = () => new PaymentError(502, 'A BukioPay retornou dados de pagamento inconsistentes. Consulte o suporte antes de tentar novamente.');

function createService({env=process.env, fetcher=globalThis.fetch, clock=Date.now}={}) {
  function key() {
    const value = env.BUKIOPAY_API_KEY?.trim();
    if (!value) throw new PaymentError(503, 'Pagamento ainda não configurado. Cadastre BUKIOPAY_API_KEY na Vercel.');
    return value;
  }
  const secret = () => crypto.createHmac('sha256',key()).update('GameX BukioPay orders v1').digest();
  function seal(order) {
    const iv=crypto.randomBytes(12), cipher=crypto.createCipheriv('aes-256-gcm',secret(),iv);
    const bytes=Buffer.concat([cipher.update(JSON.stringify(order),'utf8'),cipher.final()]);
    return 'gxu1_'+Buffer.concat([iv,cipher.getAuthTag(),bytes]).toString('base64url');
  }
  function open(token) {
    key();
    try {
      if(typeof token!=='string'||!/^gxu1_[A-Za-z0-9_-]{80,5000}$/.test(token)) throw Error();
      const bytes=Buffer.from(token.slice(5),'base64url');
      if(bytes.toString('base64url')!==token.slice(5)) throw Error();
      const cipher=crypto.createDecipheriv('aes-256-gcm',secret(),bytes.subarray(0,12));
      cipher.setAuthTag(bytes.subarray(12,28));
      const order=JSON.parse(Buffer.concat([cipher.update(bytes.subarray(28)),cipher.final()]).toString('utf8'));
      if(order.v!==1||!Number.isSafeInteger(order.until)||order.until<=clock()||!validId(order.id)) throw Error();
      return order;
    } catch { throw new PaymentError(401,'O acesso a este pedido expirou ou a chave da loja foi alterada. Se já pagou, fale com o suporte e informe o número do pedido.'); }
  }
  function purchase(body) {
    key();
    if(!body || !Array.isArray(body.items)||!body.items.length||body.items.length>24) throw new PaymentError(400,'Carrinho vazio ou inválido.');
    if(typeof body.requestKey!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(body.requestKey)) throw new PaymentError(400,'Recarregue a página para iniciar o pagamento.');
    const email=typeof body.customer?.email==='string'?body.customer.email.trim().toLowerCase():'';
    const phone=typeof body.customer?.phone==='string'?body.customer.phone.replace(/\D/g,''):'';
    if(!/^[^\s|]+@[^\s|]+\.[^\s|]+$/.test(email)||email.length>254||!/^[0-9]{10,13}$/.test(phone)) throw new PaymentError(400,'Informe e-mail e telefone válidos.');
    const quantities=new Map();
    for(const item of body.items) {
      if(!item||!Object.hasOwn(catalog,item.id)||!Number.isInteger(item.qty)||item.qty<1||item.qty>10) throw new PaymentError(400,'Produto ou quantidade inválida.');
      const qty=(quantities.get(item.id)||0)+item.qty;
      if(qty>10) throw new PaymentError(400,'Limite de 10 unidades por produto.');
      quantities.set(item.id,qty);
    }
    const items=[...quantities].sort(([a],[b])=>a.localeCompare(b));
    const subtotal=items.reduce((total,[id,qty])=>total+Math.round(catalog[id].price*100)*qty,0);
    const coupon=['GAMEX','F0RCE','NASA'].includes(String(body.coupon||'').toUpperCase())?String(body.coupon).toUpperCase():'';
    const amount=Math.round(subtotal*(coupon?0.9:1));
    const digest=crypto.createHmac('sha256',secret()).update(JSON.stringify([body.requestKey,items,email,phone,coupon,amount])).digest();
    digest[6]=(digest[6]&15)|64;digest[8]=(digest[8]&63)|128;
    const hex=digest.subarray(0,16).toString('hex');
    const idempotencyKey=`${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
    const orderId='GX-'+idempotencyKey;
    // Contato e itens ficam na descrição da cobrança para a equipe localizar a entrega no painel.
    const description=`GameX ${orderId} | ${items.map(([id,qty])=>`${qty}x${id}`).join(',')} | ${email} | ${phone}`;
    return {amount,description,idempotencyKey,orderId};
  }
  async function request(route,body,idempotencyKey) {
    const apiKey=key();let response,data;
    try {
      response=await fetcher('https://bukio.up.railway.app/v1'+route,{
        method:body?'POST':'GET',redirect:'error',signal:AbortSignal.timeout(12000),
        headers:{Authorization:'Bearer '+apiKey,Accept:'application/json',...(body?{'Content-Type':'application/json','Idempotency-Key':idempotencyKey}:{})},
        ...(body?{body:JSON.stringify(body)}:{})
      });
      data=await response.json();
    } catch { throw new PaymentError(502,'Não foi possível comunicar com a BukioPay. Tente novamente para recuperar a mesma cobrança.'); }
    if(!response.ok||!data||typeof data!=='object'||Array.isArray(data)||data.error||data.success===false) {
      const raw=data?.error?.code??data?.code;
      const code=typeof raw==='string'&&/^[A-Z_]{2,70}$/.test(raw)?raw:'PROVIDER_ERROR';
      const hints={KYC_REQUIRED:'Conclua a verificação da conta na BukioPay.',PIX_IN_PAUSED:'O recebimento Pix está pausado na BukioPay.',MAINTENANCE:'A BukioPay está em manutenção.',IDEMPOTENCY_CONFLICT:'Confira esta tentativa no suporte.'};
      const hint=hints[code]||(response.status===401?'A chave da BukioPay não foi aceita.':response.status===403?'Confira as permissões payments:create e payments:get da chave.':response.status===429?'Aguarde um pouco antes de tentar novamente.':'Tente novamente para recuperar a mesma cobrança.');
      throw new PaymentError(response.status===429?429:502,`BukioPay (${response.status} · ${code}): ${hint}`);
    }
    return data;
  }
  function verify(data,order) {
    if(!validId(data.id)||data.amount!==order.amount||!Number.isSafeInteger(data.amount)||data.description!==order.description||
       (order.id&&data.id!==order.id)||(data.method!=null&&data.method!=='pix')||(data.currency!=null&&data.currency!=='BRL')||
       (data.idempotencyKey!=null&&data.idempotencyKey!==order.idempotencyKey)||!Object.hasOwn(states,data.status)) throw invalid();
    const total=data.total??order.total??data.amount;
    if(!Number.isSafeInteger(total)||total<order.amount||(order.total!=null&&order.total!==total)) throw invalid();
    return total;
  }
  async function create(body) {
    const order=purchase(body);
    let data=await request('/payments',{amount:order.amount,method:'pix',description:order.description},order.idempotencyKey);
    const total=verify(data,order);
    const stored={...order,v:1,id:data.id,total,until:clock()+30*86400000};
    // A aprovação sempre vem da consulta autenticada, inclusive em tentativas repetidas.
    if(data.status!=='pending') { data=await request('/payments/'+encodeURIComponent(data.id));verify(data,stored); }
    const expiresAt=Date.parse(data.expiresAt||'');
    let copyPaste='';
    if(data.status==='pending') {
      copyPaste=typeof data.copyPaste==='string'?data.copyPaste.trim():'';
      if(!/^000201[\x20-\x7e]{20,4090}$/.test(copyPaste)||!Number.isFinite(expiresAt)) throw invalid();
      const encodedTotal=pixTotal(copyPaste);
      if(encodedTotal!==null&&encodedTotal!==total) throw invalid();
    }
    return {provider:'bukiopay',orderId:order.orderId,total:total/100,subtotal:order.amount/100,fee:(total-order.amount)/100,
      accessToken:seal(stored),status:states[data.status],payment:{id:data.id,copyPaste,expiresAt:Number.isFinite(expiresAt)?new Date(expiresAt).toISOString():null}};
  }
  async function current(token) {
    const order=open(token), data=await request('/payments/'+encodeURIComponent(order.id));
    verify(data,order);
    return {status:states[data.status],id:order.id,orderId:order.orderId};
  }
  return {create,current};
}
function validId(value) { return typeof value==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(value); }
function pixTotal(code) {
  for(let offset=0;offset+4<=code.length;) {
    const tag=code.slice(offset,offset+2),length=code.slice(offset+2,offset+4);
    if(!/^\d{2}$/.test(tag)||!/^\d{2}$/.test(length)) return null;
    const end=offset+4+Number(length);if(end>code.length)return null;
    const value=code.slice(offset+4,end);
    if(tag==='54') return /^\d{1,7}\.\d{2}$/.test(value)?Math.round(Number(value)*100):null;
    offset=end;
  }
  return null;
}
module.exports={createService,PaymentError};
