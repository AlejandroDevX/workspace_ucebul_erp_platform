import { erpApi, createCrudService } from '@/services/erpApi'
import type { Contract, CreateContractDto, UpdateContractDto } from '../types/contract.types'
import type { EntityId } from '@/types/common'

const baseService = createCrudService<Contract, CreateContractDto, UpdateContractDto>('/erp/contracts')

export const contractsService = {
  ...baseService,
  async moveStep(id: EntityId, payload?: Record<string, unknown>) {
    const response = await erpApi.post(`/erp/contracts/${id}/move-step`, payload ?? {})
    return response.data
  },
  async close(id: EntityId, payload?: Record<string, unknown>) {
    const response = await erpApi.post(`/erp/contracts/${id}/close`, payload ?? {})
    return response.data
  },
  async requestSignature(id: EntityId, payload?: { erp_external_signature_request_document_id?: EntityId }) {
    const response = await erpApi.post(`/erp/contracts/${id}/request-signature`, payload ?? {})
    return response.data
  },
}
