import { z } from 'zod';

// Helper para aceitar número, string vazia ou null - validação relaxada
const numberOrEmpty = z.preprocess(
  (val) => {
    if (val === '' || val === null || val === undefined) return null;
    if (typeof val === 'string') {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? null : parsed;
    }
    return val;
  },
  z.number().min(0, 'Valor deve ser positivo').optional().nullable()
);

// Schema Financeiro - Validação relaxada para permitir salvamento parcial
export const financialSchema = z.object({
  contractValue: numberOrEmpty,
  commissionValue: numberOrEmpty,
  dueDate: z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().optional().nullable()
  ),
  installments: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      if (typeof val === 'string') {
        const parsed = parseInt(val);
        return isNaN(parsed) ? null : parsed;
      }
      return val;
    },
    z.number().int().min(1, 'Mínimo 1 parcela').optional().nullable()
  ),
  installmentValue: numberOrEmpty,
  discountValue: numberOrEmpty,
  discountAuthorized: z.boolean().optional().nullable(),
  registrationFee: numberOrEmpty,
  leadOrigin: z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().optional().nullable()
  ),
});

export type FinancialFormData = z.infer<typeof financialSchema>;

// Schema Comercial - Validação relaxada para permitir salvamento parcial
export const commercialSchema = z.object({
  isDisabledPerson: z.boolean().optional().nullable(),
  hasMobilityRestriction: z.boolean().optional().nullable(),
  mobilityDetails: z.string().optional().nullable().or(z.literal('')),
  foodRestrictions: z.string().optional().nullable().or(z.literal('')),
  shirtSize: z.string().optional().nullable().or(z.literal('')),
  pantsSize: z.string().optional().nullable().or(z.literal('')),
  postSaleStatus: z.string().optional().nullable().or(z.literal('')),
  contractSignedStatus: z.string().optional().nullable().or(z.literal('')),
  studentStatus: z.string().optional().nullable().or(z.literal('')),
  classStatus: z.string().optional().nullable().or(z.literal('')),
  boletoEmissionStatus: z.string().optional().nullable().or(z.literal('')),
  boletosGenerated: z.boolean().optional().nullable(),
  portalAccess: z.boolean().optional().nullable(),
}).refine(
  (data) => {
    // Se hasMobilityRestriction é true, mobilityDetails é obrigatório
    // Mas permitimos salvamento parcial - apenas avisamos se necessário
    if (data.hasMobilityRestriction === true) {
      return (
        data.mobilityDetails !== null &&
        data.mobilityDetails !== undefined &&
        data.mobilityDetails !== '' &&
        data.mobilityDetails.trim() !== ''
      );
    }
    return true;
  },
  {
    message: 'Detalhes de mobilidade são obrigatórios quando há restrição',
    path: ['mobilityDetails'],
  }
);

export type CommercialFormData = z.infer<typeof commercialSchema>;

// Schema Jurídico - Validação relaxada para permitir salvamento parcial
export const legalSchema = z.object({
  docRg: z.string().optional().nullable().or(z.literal('')),
  docCpf: z.string().optional().nullable().or(z.literal('')),
  docDiploma: z.string().optional().nullable().or(z.literal('')),
  docHistory: z.string().optional().nullable().or(z.literal('')),
  docBirthCert: z.string().optional().nullable().or(z.literal('')),
  docAddressProof: z.string().optional().nullable().or(z.literal('')),
  docCrmv: z.string().optional().nullable().or(z.literal('')),
  docProfilePic: z.string().optional().nullable().or(z.literal('')),
  docMecCert: z.string().optional().nullable().or(z.literal('')),
  docFacultyIssuer: z.string().optional().nullable().or(z.literal('')),
  isTransfer: z.boolean().optional().nullable(),
  generalObservations: z.string().optional().nullable().or(z.literal('')),
}).refine(
  (data) => {
    // Se isTransfer é true, generalObservations é obrigatório
    // Mas permitimos salvamento parcial - apenas avisamos se necessário
    if (data.isTransfer === true) {
      return (
        data.generalObservations !== null &&
        data.generalObservations !== undefined &&
        data.generalObservations !== '' &&
        data.generalObservations.trim() !== ''
      );
    }
    return true;
  },
  {
    message: 'Observações gerais são obrigatórias para transferências',
    path: ['generalObservations'],
  }
);

export type LegalFormData = z.infer<typeof legalSchema>;
