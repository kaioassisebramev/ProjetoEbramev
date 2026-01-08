import { Enrollment } from '@prisma/client';

type StatusResult = 'complete' | 'partial' | 'empty';

interface StatusInfo {
  status: StatusResult;
  emoji: string;
  label: string;
}

/**
 * Calcula o status financeiro de um enrollment
 */
function getFinancialStatus(enrollment: Enrollment): StatusInfo {
  const financialFields = [
    enrollment.contractValue,
    enrollment.commissionValue,
    enrollment.dueDate,
    enrollment.installments,
    enrollment.installmentValue,
    enrollment.discountValue,
    enrollment.discountAuthorized,
    enrollment.registrationFee,
    enrollment.leadOrigin,
  ];

  const filledFields = financialFields.filter(
    (field) => field !== null && field !== undefined
  ).length;

  if (filledFields === 0) {
    return { status: 'empty', emoji: '🔴', label: 'Vazio' };
  }
  if (filledFields === financialFields.length) {
    return { status: 'complete', emoji: '🟢', label: 'Completo' };
  }
  return { status: 'partial', emoji: '🟡', label: 'Parcial' };
}

/**
 * Calcula o status comercial de um enrollment
 */
function getCommercialStatus(enrollment: Enrollment): StatusInfo {
  const commercialFields = [
    enrollment.isDisabledPerson,
    enrollment.hasMobilityRestriction,
    enrollment.mobilityDetails,
    enrollment.foodRestrictions,
    enrollment.shirtSize,
    enrollment.pantsSize,
    enrollment.postSaleStatus,
    enrollment.contractSignedStatus,
    enrollment.studentStatus,
    enrollment.classStatus,
    enrollment.boletoEmissionStatus,
    enrollment.boletosGenerated,
    enrollment.portalAccess,
  ];

  const filledFields = commercialFields.filter(
    (field) => field !== null && field !== undefined
  ).length;

  if (filledFields === 0) {
    return { status: 'empty', emoji: '🔴', label: 'Vazio' };
  }
  if (filledFields === commercialFields.length) {
    return { status: 'complete', emoji: '🟢', label: 'Completo' };
  }
  return { status: 'partial', emoji: '🟡', label: 'Parcial' };
}

/**
 * Calcula o status jurídico de um enrollment
 */
function getLegalStatus(enrollment: Enrollment): StatusInfo {
  const legalFields = [
    enrollment.docRg,
    enrollment.docCpf,
    enrollment.docDiploma,
    enrollment.docHistory,
    enrollment.docBirthCert,
    enrollment.docAddressProof,
    enrollment.docCrmv,
    enrollment.docProfilePic,
    enrollment.docMecCert,
    enrollment.docFacultyIssuer,
  ];

  const filledFields = legalFields.filter(
    (field) => field !== null && field !== undefined
  ).length;

  if (filledFields === 0) {
    return { status: 'empty', emoji: '🔴', label: 'Vazio' };
  }
  if (filledFields === legalFields.length) {
    return { status: 'complete', emoji: '🟢', label: 'Completo' };
  }
  return { status: 'partial', emoji: '🟡', label: 'Parcial' };
}

/**
 * Retorna o status baseado na role do usuário
 */
export function getEnrollmentStatus(
  enrollment: Enrollment,
  userRole: string
): StatusInfo | StatusInfo[] {
  if (userRole === 'FINANCIAL') {
    return getFinancialStatus(enrollment);
  }

  if (userRole === 'COMMERCIAL') {
    return getCommercialStatus(enrollment);
  }

  if (userRole === 'LEGAL') {
    return getLegalStatus(enrollment);
  }

  // ADMIN vê todos os status
  if (userRole === 'ADMIN') {
    return [
      getFinancialStatus(enrollment),
      getCommercialStatus(enrollment),
      getLegalStatus(enrollment),
    ];
  }

  // Fallback para outras roles
  return getCommercialStatus(enrollment);
}
