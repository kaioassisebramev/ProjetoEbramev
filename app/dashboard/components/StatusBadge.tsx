'use client';

import { NotaFiscal } from '@prisma/client';

interface StatusBadgeProps {
  nota: NotaFiscal & { valorTotal?: number };
}

export function StatusBadge({ nota }: StatusBadgeProps) {
  const hoje = new Date();
  // Usa UTC para evitar problemas de timezone
  const hojeUTC = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate()));
  
  const vencimento = new Date(nota.dataVencimento);
  // Usa UTC para evitar problemas de timezone
  const vencimentoUTC = new Date(Date.UTC(
    vencimento.getUTCFullYear(),
    vencimento.getUTCMonth(),
    vencimento.getUTCDate()
  ));
  
  const diasAteVencimento = Math.ceil((vencimentoUTC.getTime() - hojeUTC.getTime()) / (1000 * 60 * 60 * 24));

  let status: 'PAGO' | 'VENCIDA' | 'PROXIMO' | 'AGUARDANDO';
  let cor: string;
  let label: string;

  if (nota.pago) {
    status = 'PAGO';
    cor = 'bg-green-100 text-green-800 border-green-200';
    label = 'Pago';
  } else if (diasAteVencimento < 0) {
    status = 'VENCIDA';
    cor = 'bg-red-100 text-red-800 border-red-200';
    label = 'Vencida';
  } else if (diasAteVencimento <= 7) {
    status = 'PROXIMO';
    cor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
    label = `Vence em ${diasAteVencimento} dia${diasAteVencimento !== 1 ? 's' : ''}`;
  } else {
    status = 'AGUARDANDO';
    cor = 'bg-blue-100 text-blue-800 border-blue-200';
    label = `Vence em ${diasAteVencimento} dias`;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cor}`}
      title={label}
    >
      {label}
    </span>
  );
}
