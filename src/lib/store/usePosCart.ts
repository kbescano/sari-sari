import { create } from 'zustand'

export interface PosCartLine {
  productId: string
  title: string
  unitPrice: number
  unitType: 'piece' | 'pack' | 'sachet'
  quantity: number
}

export type PaymentMethod = 'Cash' | 'Credit/Utang'

interface PosCartState {
  lines: PosCartLine[]
  paymentMethod: PaymentMethod
  cashTendered: number | null
  addLine: (product: Omit<PosCartLine, 'quantity'>) => void
  incrementLine: (productId: string, delta: number) => void
  removeLine: (productId: string) => void
  setPaymentMethod: (method: PaymentMethod) => void
  setCashTendered: (amount: number | null) => void
  clearSale: () => void
}

export const usePosCart = create<PosCartState>((set) => ({
  lines: [],
  paymentMethod: 'Cash',
  cashTendered: null,

  addLine: (product) =>
    set((state) => {
      const existing = state.lines.find((line) => line.productId === product.productId)
      if (existing) {
        return {
          lines: state.lines.map((line) =>
            line.productId === product.productId ? { ...line, quantity: line.quantity + 1 } : line,
          ),
        }
      }
      return { lines: [...state.lines, { ...product, quantity: 1 }] }
    }),

  incrementLine: (productId, delta) =>
    set((state) => ({
      lines: state.lines
        .map((line) => (line.productId === productId ? { ...line, quantity: line.quantity + delta } : line))
        .filter((line) => line.quantity > 0),
    })),

  removeLine: (productId) =>
    set((state) => ({ lines: state.lines.filter((line) => line.productId !== productId) })),

  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setCashTendered: (amount) => set({ cashTendered: amount }),

  clearSale: () => set({ lines: [], paymentMethod: 'Cash', cashTendered: null }),
}))

export const selectCartTotal = (state: PosCartState) =>
  state.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
