import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Send } from 'lucide-react'
import { erpApi } from '@/services/erpApi'
import { getErrorMessage } from '@/utils/error-message'
import { formatDate } from '@/utils/format'
import { useAuth } from '@/hooks/useAuth'
import { Can } from '@/components/permissions/Can'
import type { ErpComment, CreateCommentDto } from '../types/comment.types'
import type { EntityId } from '@/types/common'

interface CommentsPanelProps {
  referenceType: string
  referenceId: EntityId
}

function useCommentsQuery(referenceType: string, referenceId: EntityId) {
  return useQuery({
    queryKey: ['comments', referenceType, referenceId],
    queryFn: async () => {
      const response = await erpApi.get('/erp/comments', {
        params: { erp_comment_reference_type: referenceType, erp_comment_reference_id: referenceId },
      })
      const data = response.data as { data?: ErpComment[] | { data?: ErpComment[] } }

      if (data?.data) {
        if (Array.isArray(data.data)) return data.data
        if (Array.isArray((data.data as { data?: ErpComment[] }).data)) return (data.data as { data?: ErpComment[] }).data!
      }

      return [] as ErpComment[]
    },
    enabled: Boolean(referenceId),
  })
}

export function CommentsPanel({ referenceType, referenceId }: CommentsPanelProps) {
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { user, hasPermission } = useAuth()
  const queryClient = useQueryClient()

  const query = useCommentsQuery(referenceType, referenceId)

  const createMutation = useMutation({
    mutationFn: (payload: CreateCommentDto) => erpApi.post('/erp/comments', payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', referenceType, referenceId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: EntityId) => erpApi.delete(`/erp/comments/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', referenceType, referenceId] })
    },
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!body.trim()) return

    try {
      await createMutation.mutateAsync({
        erp_comment_body: body,
        erp_comment_reference_type: referenceType,
        erp_comment_reference_id: referenceId,
        erp_comment_author_name: [user?.name, user?.lastName].filter(Boolean).join(' ') || user?.email || '',
      })
      setBody('')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <h2 className="panel__title">Comentarios</h2>
      </div>

      {query.isLoading && (
        <div className="panel__loading">
          <div className="spinner spinner--sm" aria-label="Cargando..." />
        </div>
      )}

      {query.data && query.data.length === 0 && (
        <p className="panel__empty">Sin comentarios aún.</p>
      )}

      {query.data && query.data.length > 0 && (
        <ul className="comment-list">
          {query.data.map((comment: ErpComment) => (
            <li key={String(comment.erp_comment_id)} className="comment-item">
              <div className="comment-item__header">
                <strong className="comment-item__author">
                  {comment.erp_comment_author_name ?? 'Usuario'}
                </strong>
                <span className="comment-item__date">
                  {formatDate(comment.erp_comment_created_at)}
                </span>
                <Can permission="erp.comments.delete">
                  <button
                    className="btn btn--ghost btn--sm btn--danger"
                    type="button"
                    disabled={deleteMutation.isPending}
                    onClick={() => void deleteMutation.mutate(comment.erp_comment_id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </Can>
              </div>
              <p className="comment-item__body">{comment.erp_comment_body}</p>
            </li>
          ))}
        </ul>
      )}

      {hasPermission('erp.comments.create') && (
        <form className="comment-form" noValidate onSubmit={(e) => void handleSubmit(e)}>
          <textarea
            className="input comment-form__textarea"
            placeholder="Escribe un comentario..."
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          {error && <p className="panel__form-error">{error}</p>}
          <div className="comment-form__actions">
            <button
              className="btn btn--primary btn--sm"
              type="submit"
              disabled={createMutation.isPending || !body.trim()}
            >
              <Send size={14} aria-hidden="true" />
              {createMutation.isPending ? 'Enviando...' : 'Comentar'}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
