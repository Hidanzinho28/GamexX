import service from '../lib/bukiopay.cjs';
export async function GET(request) {
  try {
    const token=(request.headers.get('authorization')||'').replace(/^Bearer /,'');
    return reply(200,await service.createService().current(token));
  }catch(error){return reply(error.status||500,{error:error.status?error.message:'Não foi possível consultar o pagamento.'});}
}
function reply(status,body) {return Response.json(body,{status,headers:{'Cache-Control':'no-store'}});}
