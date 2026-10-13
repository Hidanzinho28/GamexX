export function GET() {
  const configured=Boolean(process.env.BUKIOPAY_API_KEY?.trim());
  return Response.json({provider:'BukioPay',configured,paymentVerified:false,...(!configured?{missing:['BUKIOPAY_API_KEY']}:{})},
    {status:configured?200:503,headers:{'Cache-Control':'no-store'}});
}
