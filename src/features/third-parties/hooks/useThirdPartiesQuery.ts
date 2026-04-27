import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { thirdPartiesService } from '../api/third-parties.service'
import type { ThirdPartyFilters } from '../types/third-party.types'
import type { EntityId } from '@/types/common'

const QUERY_KEY = 'third-parties'

export function useThirdPartiesQuery(filters?: ThirdPartyFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => thirdPartiesService.list(filters as Record<string, unknown>),
  })
}

export function useThirdPartyQuery(id: EntityId) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => thirdPartiesService.getById(id),
    enabled: Boolean(id),
  })
}

export function useCreateThirdPartyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: thirdPartiesService.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export function useUpdateThirdPartyMutation(id: EntityId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Parameters<typeof thirdPartiesService.update>[1]) =>
      thirdPartiesService.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export function useDeleteThirdPartyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: EntityId) => thirdPartiesService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export function useThirdPartyRequiredDocumentsStatusQuery(id: EntityId) {
  return useQuery({
    queryKey: [QUERY_KEY, id, 'required-documents-status'],
    queryFn: () => thirdPartiesService.getRequiredDocumentsStatus(id),
    enabled: Boolean(id),
  })
}
