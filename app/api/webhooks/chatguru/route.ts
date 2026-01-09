import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verificação de segurança: valida o webhook secret
    const webhookSecret = request.headers.get('x-webhook-secret');
    const expectedSecret = process.env.WEBHOOK_SECRET;

    if (!expectedSecret) {
      console.error('⚠️ WEBHOOK_SECRET não configurado nas variáveis de ambiente');
      return NextResponse.json(
        { error: 'Configuração do servidor inválida' },
        { status: 500 }
      );
    }

    if (!webhookSecret || webhookSecret !== expectedSecret) {
      console.warn('🚫 Tentativa de webhook com secret inválido');
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Recebe o body do webhook
    const body = await request.json();
    
    // Log do webhook recebido (mock por enquanto)
    console.log('📥 Webhook recebido do ChatGuru:', JSON.stringify(body, null, 2));

    // TODO: Implementar lógica de salvar no banco depois que o deploy funcionar
    // Por enquanto, apenas retorna sucesso

    return NextResponse.json(
      { 
        success: true, 
        message: 'Webhook recebido com sucesso',
        receivedAt: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    
    // Se o erro for de parsing JSON, retorna 400
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Body inválido. Esperado JSON.' },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: `Erro ao processar webhook: ${errorMessage}` },
      { status: 500 }
    );
  }
}
