const contractStatus: Record<string, string> = {
  draft: 'Borrador',
  contractor_data: 'Datos del contratista',
  documents_uploaded: 'Documentos cargados',
  administrative_review: 'Revisión administrativa',
  documentation_review: 'Revisión de documentación',
  legal_review: 'Revisión jurídica',
  direction_review: 'Aprobación dirección',
  pending_approval: 'Pendiente de aprobación',
  pending_signature: 'Pendiente de firma',
  signed: 'Firmado',
  active: 'Activo',
  closed: 'Cerrado',
  cancelled: 'Cancelado',
}

const processStatus: Record<string, string> = {
  draft: 'Borrador',
  in_progress: 'En progreso',
  pending_review: 'Pendiente de revisión',
  pending_approval: 'Pendiente de aprobación',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  pending_signature: 'Pendiente de firma',
  signed: 'Firmado',
  closed: 'Cerrado',
  cancelled: 'Cancelado',
}

const addendumStatus: Record<string, string> = {
  draft: 'Borrador',
  supports_uploaded: 'Soportes cargados',
  administrative_review: 'Revisión administrativa',
  legal_review: 'Revisión jurídica',
  direction_review: 'Aprobación dirección',
  pending_signature: 'Pendiente de firma',
  signed: 'Firmado',
  closed: 'Cerrado',
  cancelled: 'Cancelado',
}

const approvalStatus: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
}

const signatureStatus: Record<string, string> = {
  pending: 'Pendiente',
  viewed: 'Visto',
  signed: 'Firmado',
  expired: 'Expirado',
  cancelled: 'Cancelado',
}

const addendumType: Record<string, string> = {
  date: 'Fecha',
  position: 'Cargo',
  functions: 'Funciones',
  value: 'Valor',
  payment_method: 'Forma de pago',
  supervisor: 'Supervisor',
  other: 'Otro',
}

const eventType: Record<string, string> = {
  created: 'Creado',
  updated: 'Actualizado',
  status_changed: 'Cambio de estado',
  document_uploaded: 'Documento cargado',
  approval_resolved: 'Aprobación resuelta',
  step_moved: 'Avance de paso',
}

const contractType: Record<string, string> = {
  services: 'Prestación de servicios',
  supply: 'Suministro',
  lease: 'Arrendamiento',
  work: 'Obra',
  other: 'Otro',
}

const paymentMethod: Record<string, string> = {
  monthly: 'Mensual',
  biweekly: 'Quincenal',
  milestone: 'Por entregable',
  single: 'Único pago',
}

function translate(dict: Record<string, string>, key?: string | null): string {
  if (!key) return '—'
  return dict[key] ?? key
}

const LEGACY_EVENT_TITLE_PATTERNS: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^Process moved to step (.+)$/, (m) => `Proceso avanzó a: ${m[1]}`],
  [/^Process created for workflow (.+)$/, (m) => `Proceso creado en flujo: ${m[1]}`],
  [/^Contract status changed to (.+)$/, () => 'Estado del contrato actualizado'],
  [/^Contract addendum status changed to (.+)$/, () => 'Estado del otrosí actualizado'],
  [/^Contract (.+) updated$/, (m) => `Contrato ${m[1]} actualizado`],
  [/^Contract (.+) created$/, (m) => `Contrato ${m[1]} creado`],
  [/^Contract addendum (.+) updated$/, (m) => `Otrosí ${m[1]} actualizado`],
  [/^Document uploaded: (.+)$/, (m) => `Documento cargado: ${m[1]}`],
  [/^Approval (.+)$/, (m) => `Aprobación ${m[1]}`],
]

function translateEventTitle(title?: string | null): string {
  if (!title) return '—'
  for (const [pattern, transform] of LEGACY_EVENT_TITLE_PATTERNS) {
    const match = title.match(pattern)
    if (match) return transform(match)
  }
  return title
}

export const label = {
  contractStatus: (v?: string | null) => translate(contractStatus, v),
  processStatus: (v?: string | null) => translate(processStatus, v),
  addendumStatus: (v?: string | null) => translate(addendumStatus, v),
  approvalStatus: (v?: string | null) => translate(approvalStatus, v),
  signatureStatus: (v?: string | null) => translate(signatureStatus, v),
  addendumType: (v?: string | null) => translate(addendumType, v),
  contractType: (v?: string | null) => translate(contractType, v),
  paymentMethod: (v?: string | null) => translate(paymentMethod, v),
  eventType: (v?: string | null) => translate(eventType, v),
  eventTitle: (v?: string | null) => translateEventTitle(v),
}
