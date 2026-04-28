import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contractAddendumsService } from '../api/contract-addendums.service'
import type { UpdateContractAddendumDto } from '../types/contract-addendum.types'
import type { EntityId } from '@/types/common'

const QUERY_KEY = 'contract-addendums'

export function useContractAddendumsQuery(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => contractAddendumsService.list(filters),
  })
}

export function useMyAddendumsQuery() {
  return useQuery({
    queryKey: [QUERY_KEY, 'my-tasks'],
    queryFn: () => contractAddendumsService.list({ my_tasks: 1 }),
    staleTime: 30_000,
  })
}

export function useContractAddendumQuery(id: EntityId) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => contractAddendumsService.getById(id),
    enabled: Boolean(id),
  })
}

export function useCreateContractAddendumMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: contractAddendumsService.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export function useUpdateContractAddendumMutation(id: EntityId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateContractAddendumDto) => contractAddendumsService.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export function useDeleteContractAddendumMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: EntityId) => contractAddendumsService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export function useMoveAddendumStepMutation(id: EntityId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload?: Record<string, unknown>) => contractAddendumsService.moveStep(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] })
    },
  })
}

export function useCloseAddendumMutation(id: EntityId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => contractAddendumsService.close(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] })
    },
  })
}

export function useRequestAddendumSignatureMutation(id: EntityId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload?: { erp_external_signature_request_document_id?: EntityId }) =>
      contractAddendumsService.requestSignature(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] })
    },
  })
}
