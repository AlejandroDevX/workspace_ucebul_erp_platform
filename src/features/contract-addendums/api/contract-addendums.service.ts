import { erpApi, createCrudService } from '@/services/erpApi'
import type { ContractAddendum, CreateContractAddendumDto, UpdateContractAddendumDto } from '../types/contract-addendum.types'
import type { EntityId } from '@/types/common'

const baseService = createCrudService<ContractAddendum, CreateContractAddendumDto, UpdateContractAddendumDto>(
  '/erp/contract-addendums',
)

export const contractAddendumsService = {
  ...baseService,
  async moveStep(id: EntityId, payload?: Record<string, unknown>) {
    const response = await erpApi.post(`/erp/contract-addendums/${id}/move-step`, payload ?? {})
    return response.data
  },
  async close(id: EntityId, payload?: Record<string, unknown>) {
    const response = await erpApi.post(`/erp/contract-addendums/${id}/close`, payload ?? {})
    return response.data
  },
}
