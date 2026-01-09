import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Validação de segurança: verifica o header x-webhook-secret
    const webhookSecret = request.headers.get('x-webhook-secret');
    const expectedSecret = process.env.WEBHOOK_SECRET;

    if (!webhookSecret || webhookSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Recebe o JSON do body
    const body = await request.json();
    
    // Log dos dados recebidos
    console.log('Webhook recebido:', body);

    // Retorna sucesso
    return NextResponse.json(
      { message: 'Recebido' },
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
