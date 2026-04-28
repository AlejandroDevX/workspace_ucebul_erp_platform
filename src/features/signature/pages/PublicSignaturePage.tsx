import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { signatureService } from '../api/signature.service'
import { getErrorMessage } from '@/utils/error-message'

export function PublicSignaturePage() {
  const { token } = useParams<{ token: string }>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [signed, setSigned] = useState(false)
  const [signError, setSignError] = useState<string | null>(null)

  const requestQuery = useQuery({
    queryKey: ['signature-request', token],
    queryFn: () => signatureService.getByToken(token ?? ''),
    enabled: Boolean(token),
    retry: false,
  })

  const signMutation = useMutation({
    mutationFn: (imageUrl: string) => signatureService.sign(token ?? '', imageUrl),
    onSuccess: () => setSigned(true),
    onError: (err) => setSignError(getErrorMessage(err)),
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#1a1a2e'
  }, [])

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
    setHasSignature(true)
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    if (!isDrawing) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  function endDraw() {
    setIsDrawing(false)
  }

  function clearCanvas() {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  function handleSign() {
    const canvas = canvasRef.current!
    const imageUrl = canvas.toDataURL('image/png')
    setSignError(null)
    signMutation.mutate(imageUrl)
  }

  if (requestQuery.isLoading) {
    return (
      <div className="sign-page">
        <div className="sign-page__card">
          <div className="loading-state">
            <div className="spinner" aria-label="Cargando..." />
            <p>Cargando solicitud de firma...</p>
          </div>
        </div>
      </div>
    )
  }

  if (requestQuery.isError) {
    return (
      <div className="sign-page">
        <div className="sign-page__card">
          <div className="sign-page__error">
            <h1>Enlace no válido</h1>
            <p>{getErrorMessage(requestQuery.error)}</p>
          </div>
        </div>
      </div>
    )
  }

  if (signed) {
    return (
      <div className="sign-page">
        <div className="sign-page__card">
          <div className="sign-page__success">
            <div className="sign-page__success-icon">✓</div>
            <h1>¡Documento firmado exitosamente!</h1>
            <p>Gracias por firmar el documento. Puede cerrar esta página.</p>
          </div>
        </div>
      </div>
    )
  }

  const request = requestQuery.data

  return (
    <div className="sign-page">
      <div className="sign-page__card">
        <div className="sign-page__header">
          <h1 className="sign-page__title">Solicitud de firma digital</h1>
          <p className="sign-page__subtitle">
            Estimado/a <strong>{request?.erp_external_signature_request_signer_name}</strong>,
            por favor firme el siguiente documento.
          </p>
        </div>

        {request?.document && (
          <div className="sign-page__document-info">
            <p className="sign-page__label">Documento:</p>
            <p className="sign-page__value">{request.document.erp_document_name}</p>
          </div>
        )}

        {request?.erp_external_signature_request_expires_at && (
          <div className="sign-page__document-info">
            <p className="sign-page__label">Válido hasta:</p>
            <p className="sign-page__value">
              {new Date(request.erp_external_signature_request_expires_at).toLocaleDateString('es-CO', {
                dateStyle: 'long',
              })}
            </p>
          </div>
        )}

        <div className="sign-page__canvas-section">
          <p className="sign-page__canvas-label">Dibuje su firma aquí:</p>
          <div className="sign-page__canvas-wrapper">
            <canvas
              ref={canvasRef}
              width={500}
              height={200}
              className="sign-page__canvas"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
          </div>
          <button
            className="btn btn--ghost btn--sm"
            type="button"
            onClick={clearCanvas}
          >
            Borrar firma
          </button>
        </div>

        {signError && (
          <div className="alert alert--danger">
            <p>{signError}</p>
          </div>
        )}

        <div className="sign-page__actions">
          <button
            className="btn btn--primary"
            type="button"
            disabled={!hasSignature || signMutation.isPending}
            onClick={handleSign}
          >
            {signMutation.isPending ? 'Enviando firma...' : 'Firmar documento'}
          </button>
        </div>
      </div>
    </div>
  )
}
