import { Enrollment } from '@prisma/client';

/**
 * Retorna um array de campos faltantes para o departamento Financeiro
 */
export function getMissingFields(
  enrollment: Enrollment,
  type: 'FINANCIAL' | 'COMMERCIAL' | 'LEGAL'
): string[] {
  const missing: string[] = [];

  if (type === 'FINANCIAL') {
    if (!enrollment.contractValue && enrollment.contractValue !== 0) {
      missing.push('Valor do Contrato');
    }
    if (!enrollment.commissionValue && enrollment.commissionValue !== 0) {
      missing.push('Valor da Comissão');
    }
    if (!enrollment.dueDate) {
      missing.push('Data de Vencimento');
    }
    if (!enrollment.installments) {
      missing.push('Número de Parcelas');
    }
    if (!enrollment.installmentValue && enrollment.installmentValue !== 0) {
      missing.push('Valor da Parcela');
    }
    if (enrollment.discountValue === null || enrollment.discountValue === undefined) {
      missing.push('Valor do Desconto');
    }
    if (enrollment.discountAuthorized === null || enrollment.discountAuthorized === undefined) {
      missing.push('Desconto Autorizado');
    }
    if (!enrollment.registrationFee && enrollment.registrationFee !== 0) {
      missing.push('Taxa de Matrícula');
    }
    if (!enrollment.leadOrigin) {
      missing.push('Origem do Lead');
    }
  }

  if (type === 'COMMERCIAL') {
    if (enrollment.isDisabledPerson === null || enrollment.isDisabledPerson === undefined) {
      missing.push('Pessoa com Deficiência');
    }
    if (enrollment.hasMobilityRestriction === null || enrollment.hasMobilityRestriction === undefined) {
      missing.push('Restrição de Mobilidade');
    }
    if (enrollment.hasMobilityRestriction === true && !enrollment.mobilityDetails) {
      missing.push('Detalhes de Mobilidade');
    }
    if (!enrollment.foodRestrictions) {
      missing.push('Restrições Alimentares');
    }
    if (!enrollment.shirtSize) {
      missing.push('Tamanho da Camisa');
    }
    if (!enrollment.pantsSize) {
      missing.push('Tamanho da Calça');
    }
    if (!enrollment.postSaleStatus) {
      missing.push('Status Pós-Venda');
    }
    if (!enrollment.contractSignedStatus) {
      missing.push('Status de Assinatura do Contrato');
    }
    if (!enrollment.studentStatus) {
      missing.push('Status do Aluno');
    }
    if (!enrollment.classStatus) {
      missing.push('Status da Turma');
    }
    if (!enrollment.boletoEmissionStatus) {
      missing.push('Status de Emissão de Boleto');
    }
    if (enrollment.boletosGenerated === null || enrollment.boletosGenerated === undefined) {
      missing.push('Boletos Gerados');
    }
    if (enrollment.portalAccess === null || enrollment.portalAccess === undefined) {
      missing.push('Acesso ao Portal');
    }
  }

  if (type === 'LEGAL') {
    // Helper para verificar se documento está pendente
    const isPending = (doc: string | null | undefined) => {
      return !doc || doc.trim() === '' || doc.toUpperCase() === 'PENDENTE';
    };

    if (isPending(enrollment.docRg)) {
      missing.push('RG');
    }
    if (isPending(enrollment.docCpf)) {
      missing.push('CPF');
    }
    if (isPending(enrollment.docDiploma)) {
      missing.push('Diploma');
    }
    if (isPending(enrollment.docHistory)) {
      missing.push('Histórico Escolar');
    }
    if (isPending(enrollment.docBirthCert)) {
      missing.push('Certidão de Nascimento');
    }
    if (isPending(enrollment.docAddressProof)) {
      missing.push('Comprovante de Endereço');
    }
    if (isPending(enrollment.docCrmv)) {
      missing.push('CRMV');
    }
    if (isPending(enrollment.docProfilePic)) {
      missing.push('Foto de Perfil');
    }
    if (isPending(enrollment.docMecCert)) {
      missing.push('Certificado MEC');
    }
    if (isPending(enrollment.docFacultyIssuer)) {
      missing.push('Emissor da Faculdade');
    }
  }

  return missing;
}
