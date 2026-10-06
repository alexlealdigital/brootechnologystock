import { ReactNode } from 'react'
import * as RTooltip from '@radix-ui/react-tooltip'
import * as RPopover from '@radix-ui/react-popover'
import { Info } from 'lucide-react'

const panelCls =
  'z-[200] max-w-[240px] rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground shadow-xl'

/** Tooltip de hover/foco — ideal para itens de navegação e botões (desktop). */
export function Tooltip({ label, children, side = 'right' }: { label: string; children: ReactNode; side?: 'top' | 'right' | 'bottom' | 'left' }) {
  return (
    <RTooltip.Provider delayDuration={150}>
      <RTooltip.Root>
        <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
        <RTooltip.Portal>
          <RTooltip.Content side={side} sideOffset={8} className={panelCls}>
            {label}
            <RTooltip.Arrow className="fill-border" />
          </RTooltip.Content>
        </RTooltip.Portal>
      </RTooltip.Root>
    </RTooltip.Provider>
  )
}

/** Ícone (i) que abre no clique/toque — funciona no desktop e no mobile.
 *  Bom para explicar métricas (KPIs). */
export function InfoHint({ text }: { text: string }) {
  return (
    <RPopover.Root>
      <RPopover.Trigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="text-muted-foreground/70 hover:text-primary transition-colors"
          aria-label="Mais informações"
        >
          <Info size={13} />
        </button>
      </RPopover.Trigger>
      <RPopover.Portal>
        <RPopover.Content side="top" sideOffset={6} className={panelCls}>
          {text}
          <RPopover.Arrow className="fill-border" />
        </RPopover.Content>
      </RPopover.Portal>
    </RPopover.Root>
  )
}
