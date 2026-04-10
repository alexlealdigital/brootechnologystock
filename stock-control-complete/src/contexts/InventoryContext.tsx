import React, { createContext, useContext } from 'react'
import { useInventory } from '@/hooks/useInventory'
import { Product, Movement } from '@/lib/supabase'

interface InventoryContextType {
  products: Product[]
  movements: Movement[]
  isLoaded: boolean
  isLoading: boolean
  error: string | null
  addProduct: (product: any) => Promise<Product>
  updateProduct: (id: string, updates: any) => Promise<Product>
  deleteProduct: (id: string) => Promise<void>
  addMovement: (movement: any) => Promise<Movement>
  updateMovement: (id: string, updates: any) => Promise<Movement>
  deleteMovement: (id: string) => Promise<void>
  getStats: () => Promise<any>
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const inventory = useInventory()

  return (
    <InventoryContext.Provider value={inventory as InventoryContextType}>
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventoryContext() {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error('useInventoryContext deve ser usado dentro de InventoryProvider')
  }
  return context
}
