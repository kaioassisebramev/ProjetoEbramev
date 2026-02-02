import { z } from 'zod';

// Schema para criar/atualizar Nota Fiscal
export const notaFiscalSchema = z.object({
  filial: z.number().int().min(1).max(2),
  empresa: z.string().min(1, 'Empresa é obrigatória'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  dataEmissao: z
    .string()
    .refine(
      (val) => {
        // Aceita formato YYYY-MM-DD (input date) ou ISO datetime
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
        return dateRegex.test(val) || datetimeRegex.test(val);
      },
      { message: 'Data de emissão inválida' }
    )
    .or(z.date()),
  dataVencimento: z
    .string()
    .refine(
      (val) => {
        // Aceita formato YYYY-MM-DD (input date) ou ISO datetime
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
        return dateRegex.test(val) || datetimeRegex.test(val);
      },
      { message: 'Data de vencimento inválida' }
    )
    .or(z.date()),
  recebimento: z.enum(['FISICO', 'EMAIL', 'WHATSAPP']),
  pago: z.boolean().default(false),
});

export type NotaFiscalFormData = z.infer<typeof notaFiscalSchema>;

// Schema para criar Item da Nota
export const itemNotaSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  unidadeMedida: z.string().min(1, 'Unidade de medida é obrigatória'),
  quantidade: z.number().positive('Quantidade deve ser positiva'),
  valorUnitario: z.number().positive('Valor unitário deve ser positivo'),
  ncm: z.string().optional().nullable(),
  icms: z.string().optional().nullable(),
  categoria: z.string().optional().nullable(),
});

export type ItemNotaFormData = z.infer<typeof itemNotaSchema>;

// Schema para filtros de busca
export const notasFiltroSchema = z.object({
  ano: z.number().int().min(2000).max(2100).optional(),
  mes: z.number().int().min(1).max(12).optional(),
  filial: z.number().int().min(1).max(2).optional(),
  pago: z.boolean().optional(),
  recebimento: z.enum(['FISICO', 'EMAIL', 'WHATSAPP']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type NotasFiltroData = z.infer<typeof notasFiltroSchema>;

// Schema para exportação Excel
export const exportExcelSchema = z.object({
  dataInicial: z
    .string()
    .refine(
      (val) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
        return dateRegex.test(val) || datetimeRegex.test(val);
      },
      { message: 'Data inicial inválida' }
    )
    .or(z.date()),
  dataFinal: z
    .string()
    .refine(
      (val) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
        return dateRegex.test(val) || datetimeRegex.test(val);
      },
      { message: 'Data final inválida' }
    )
    .or(z.date()),
});

export type ExportExcelData = z.infer<typeof exportExcelSchema>;
