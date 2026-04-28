import { Check } from 'lucide-react'

interface WorkflowStep {
  erp_workflow_step_id: number
  erp_workflow_step_slug: string
  erp_workflow_step_name: string
  erp_workflow_step_order: number
  erp_workflow_step_is_final?: boolean
}

interface WorkflowStepperProps {
  steps: WorkflowStep[]
  currentStepSlug: string | undefined
}

export function WorkflowStepper({ steps, currentStepSlug }: WorkflowStepperProps) {
  const sorted = [...steps].sort((a, b) => a.erp_workflow_step_order - b.erp_workflow_step_order)
  const currentIndex = sorted.findIndex((s) => s.erp_workflow_step_slug === currentStepSlug)

  return (
    <div className="workflow-stepper">
      {sorted.map((step, index) => {
        const isDone = index < currentIndex
        const isCurrent = index === currentIndex
        const isPending = index > currentIndex

        return (
          <div key={step.erp_workflow_step_id} className="workflow-stepper__item">
            <div className={`workflow-stepper__node ${isDone ? 'workflow-stepper__node--done' : ''} ${isCurrent ? 'workflow-stepper__node--current' : ''} ${isPending ? 'workflow-stepper__node--pending' : ''}`}>
              {isDone ? <Check size={12} strokeWidth={3} /> : <span>{index + 1}</span>}
            </div>
            <span className={`workflow-stepper__label ${isCurrent ? 'workflow-stepper__label--current' : ''}`}>
              {step.erp_workflow_step_name}
            </span>
            {index < sorted.length - 1 && (
              <div className={`workflow-stepper__connector ${isDone ? 'workflow-stepper__connector--done' : ''}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
