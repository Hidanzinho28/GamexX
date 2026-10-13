import service from '../lib/bukiopay.cjs';
export async function POST(request) {
  try {
    const origin=request.headers.get('origin');
    if(origin&&origin!==new URL(request.url).origin) return reply(403,{error:'Origem não permitida.'});
    const raw=await request.text();
    if(raw.length>12000) return reply(413,{error:'Pedido muito grande.'});
    let body;try {body=JSON.parse(raw);}catch{return reply(400,{error:'Pedido inválido.'});}
    return reply(200,await service.createService().create(body));
  } catch(error) {return reply(error.status||500,{error:error.status?error.message:'Erro ao iniciar o pagamento. Tente novamente.'});}
}
function reply(status,body) {return Response.json(body,{status,headers:{'Cache-Control':'no-store'}});}
