import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contractsService } from '../api/contracts.service'
import type { ContractFilters, UpdateContractDto } from '../types/contract.types'
import type { EntityId } from '@/types/common'

const QUERY_KEY = 'contracts'

export function useContractsQuery(filters?: ContractFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => contractsService.list(filters as Record<string, unknown>),
  })
}

export function useContractQuery(id: EntityId) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => contractsService.getById(id),
    enabled: Boolean(id),
  })
}

export function useCreateContractMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: contractsService.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export function useUpdateContractMutation(id: EntityId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateContractDto) => contractsService.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export function useDeleteContractMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: EntityId) => contractsService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export function useMoveContractStepMutation(id: EntityId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => contractsService.moveStep(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] })
    },
  })
}

export function useCloseContractMutation(id: EntityId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => contractsService.close(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] })
    },
  })
}
