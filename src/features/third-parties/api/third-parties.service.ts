import { createCrudService, erpApi } from '@/services/erpApi'
import type { ThirdParty, CreateThirdPartyDto, UpdateThirdPartyDto, ContractorRequiredDocumentsStatus } from '../types/third-party.types'
import type { EntityId } from '@/types/common'
import type { ApiSuccessResponse } from '@/types/api'

const crudService = createCrudService<ThirdParty, CreateThirdPartyDto, UpdateThirdPartyDto>('/erp/third-parties')

export const thirdPartiesService = {
  ...crudService,

  getRequiredDocumentsStatus: async (id: EntityId): Promise<ContractorRequiredDocumentsStatus> => {
    const res = await erpApi.get<ApiSuccessResponse<ContractorRequiredDocumentsStatus>>(
      `/erp/third-parties/${id}/required-documents-status`,
    )
    return res.data.data
  },

  uploadRequiredDocument: async (
    thirdPartyId: EntityId,
    documentType: string,
    file: File,
  ): Promise<{ document: ContractorRequiredDocumentsStatus['required_documents'][number]['document']; required_documents_status: ContractorRequiredDocumentsStatus }> => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await erpApi.post(
      `/erp/third-parties/${thirdPartyId}/required-documents/${documentType}`,
      formData,
      {
        // Remove the default 'application/json' Content-Type so the browser can
        // set 'multipart/form-data' with the correct boundary automatically.
        headers: { 'Content-Type': undefined },
      },
    )
    return res.data.data
  },

  deleteRequiredDocument: async (thirdPartyId: EntityId, documentType: string): Promise<ContractorRequiredDocumentsStatus> => {
    const res = await erpApi.delete<ApiSuccessResponse<ContractorRequiredDocumentsStatus>>(
      `/erp/third-parties/${thirdPartyId}/required-documents/${documentType}`,
    )
    return res.data.data
  },
}
