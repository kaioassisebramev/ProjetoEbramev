import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Validação de segurança: verifica o header x-webhook-secret ou authorization
    const webhookSecret = request.headers.get('x-webhook-secret');
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.WEBHOOK_SECRET;

    // Extrai o secret do header authorization (pode ser "Bearer TOKEN" ou apenas "TOKEN")
    const authSecret = authHeader?.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : authHeader;

    // Verifica se algum dos headers corresponde ao secret esperado
    const providedSecret = webhookSecret || authSecret;

    if (!providedSecret || providedSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Recebe o JSON do body
    const body = await request.json();
    
    // Log dos dados recebidos
    console.log('🔥 Webhook Recebido:', body);

    // Retorna sucesso
    return NextResponse.json(
      { ok: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}
