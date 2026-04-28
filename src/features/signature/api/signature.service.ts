import axios from 'axios'
import { env } from '@/config/env'

// Strip /api suffix to get the base domain
const erpBaseUrl = env.erpApiUrl.replace(/\/api$/, '')

const publicApi = axios.create({
  baseURL: erpBaseUrl,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

export interface SignatureRequestData {
  erp_external_signature_request_id: number
  erp_external_signature_request_status: string
  erp_external_signature_request_signer_name?: string
  erp_external_signature_request_signer_email?: string
  erp_external_signature_request_expires_at?: string
  erp_external_signature_request_reference_type?: string
  document?: {
    erp_document_id: number
    erp_document_name: string
    erp_document_file_path?: string
  }
  third_party?: {
    erp_third_party_name: string
  }
}

export const signatureService = {
  async getByToken(token: string): Promise<SignatureRequestData> {
    const response = await publicApi.get(`/api/erp/public/sign/${token}`)
    return response.data.data ?? response.data
  },

  async sign(token: string, signatureImageUrl: string): Promise<void> {
    await publicApi.post(`/api/erp/public/sign/${token}`, { signature_image_url: signatureImageUrl })
  },
}
