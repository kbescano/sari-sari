'use client'

import { useEffect, useRef, useState } from 'react'
import { Receipt, Minus, Plus, Trash2, CheckCircle2, ShoppingBasket, Wallet } from 'lucide-react'
import { usePosCart, selectCartTotal } from '@/lib/store/usePosCart'
import { useIsUtangEnabled } from '@/lib/store/useStoreSettings'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { formatPeso } from '@/lib/currency'
import { ProductGrid, type PosProduct } from './ProductGrid'
import { PaymentMethodSelector } from './PaymentMethodSelector'
import { SukliCalculator } from './SukliCalculator'
import { CategoryChips } from '@/components/storefront/CategoryChips'
import { SearchBar } from '@/components/storefront/SearchBar'
import { createPosOrder } from '@/app/(frontend)/(app)/pos/actions'
import { useDemoMode } from '@/lib/store/useDemoMode'

interface FlyingDotData {
  id: number
  startX: number
  startY: number
  endX: number
  endY: number
}

function FlyingDot({ startX, startY, endX, endY, onDone }: Omit<FlyingDotData, 'id'> & { onDone: () => void }) {
  const [launched, setLaunched] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setLaunched(true))
    const timer = setTimeout(onDone, 500)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
    }
  }, [onDone])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-50 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white shadow-card-hover transition-all duration-500 ease-in"
      style={{
        left: startX - 16,
        top: startY - 16,
        transform: launched ? `translate(${endX - startX}px, ${endY - startY}px) scale(0.3)` : 'translate(0, 0) scale(1)',
        opacity: launched ? 0 : 1,
      }}
    >
      <ShoppingBasket size={16} />
    </div>
  )
}

export function CashierCounter({ products }: { products: PosProduct[] }) {
  const [mobileView, setMobileView] = useState<'products' | 'bill'>('products')
  const billToggleRef = useRef<HTMLButtonElement>(null)
  const billHeaderRef = useRef<HTMLHeadingElement>(null)
  const [flyingDots, setFlyingDots] = useState<FlyingDotData[]>([])
  const nextFlyingDotId = useRef(0)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const categories = Array.from(new Set(products.map((product) => product.categoryName))).map((name) => ({
    slug: name,
    name,
  }))
  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === null || product.categoryName === activeCategory
    const matchesQuery = product.title.toLowerCase().includes(query.trim().toLowerCase())
    return matchesCategory && matchesQuery
  })

  const lines = usePosCart((state) => state.lines)
  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0)
  const total = usePosCart(selectCartTotal)
  const paymentMethod = usePosCart((state) => state.paymentMethod)
  const cashTendered = usePosCart((state) => state.cashTendered)
  const incrementLine = usePosCart((state) => state.incrementLine)
  const removeLine = usePosCart((state) => state.removeLine)
  const clearSale = usePosCart((state) => state.clearSale)
  const isUtangEnabled = useIsUtangEnabled()
  const isDemo = useDemoMode((state) => state.isDemo)

  const [utangCustomerName, setUtangCustomerName] = useState('')
  const [utangCustomerPhone, setUtangCustomerPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [demoSuccess, setDemoSuccess] = useState(false)

  const isUtangSale = isUtangEnabled && paymentMethod === 'Credit/Utang'
  const hasCashShortfall = paymentMethod === 'Cash' && (cashTendered ?? 0) < total
  const isUtangDetailsMissing = isUtangSale && (!utangCustomerName.trim() || !utangCustomerPhone.trim())

  const canCompleteSale =
    lines.length > 0 && !isSubmitting && !(paymentMethod === 'Cash' && hasCashShortfall) && !isUtangDetailsMissing

  function handleAddToCart(rect: DOMRect) {
    const targetEl =
      billToggleRef.current && billToggleRef.current.offsetParent !== null ? billToggleRef.current : billHeaderRef.current
    if (!targetEl) return
    const targetRect = targetEl.getBoundingClientRect()
    const id = nextFlyingDotId.current++
    setFlyingDots((dots) => [
      ...dots,
      {
        id,
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2,
        endX: targetRect.left + targetRect.width / 2,
        endY: targetRect.top + targetRect.height / 2,
      },
    ])
  }

  function removeFlyingDot(id: number) {
    setFlyingDots((dots) => dots.filter((dot) => dot.id !== id))
  }

  async function handleCompleteSale() {
    setIsSubmitting(true)
    setError(null)

    // Demo accounts never reach the real server action — the sale is purely simulated
    // client-side, so nothing is ever written to real store data (see assertNotDemo() in
    // src/lib/auth.ts for the server-side backstop if this were ever bypassed).
    if (isDemo) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      clearSale()
      setUtangCustomerName('')
      setUtangCustomerPhone('')
      setMobileView('products')
      setIsSubmitting(false)
      setDemoSuccess(true)
      setTimeout(() => setDemoSuccess(false), 3000)
      return
    }

    try {
      await createPosOrder({
        items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity, unitPrice: line.unitPrice })),
        totalAmount: total,
        paymentMethod,
        customerName: isUtangSale ? utangCustomerName : 'Walk-in Customer',
        customerPhone: isUtangSale ? utangCustomerPhone : 'N/A',
      })
      clearSale()
      setUtangCustomerName('')
      setUtangCustomerPhone('')
      setMobileView('products')
    } catch {
      setError('Could not complete the sale. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 mb-3 bg-slate-50 px-4 py-2 lg:hidden">
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 shadow-card">
        <button
          type="button"
          onClick={() => setMobileView('products')}
          className={`flex h-touch-min flex-1 items-center justify-center gap-2 rounded-lg text-base font-bold transition-colors ${
            mobileView === 'products' ? 'bg-white text-primary-700 shadow-card' : 'text-slate-600'
          }`}
        >
          <ShoppingBasket size={18} />
          Products
        </button>
        <button
          ref={billToggleRef}
          type="button"
          onClick={() => setMobileView('bill')}
          className={`flex h-touch-min flex-1 items-center justify-center gap-2 rounded-lg text-base font-bold transition-colors ${
            mobileView === 'bill' ? 'bg-white text-primary-700 shadow-card' : 'text-slate-600'
          }`}
        >
          <Wallet size={18} />
          Bill
          {totalQuantity > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1 text-xs font-extrabold text-white">
              {totalQuantity}
            </span>
          )}
        </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section
          aria-label="Products"
          className={`space-y-3 ${mobileView === 'products' ? 'block' : 'hidden'} lg:block`}
        >
          <div className="space-y-3 lg:sticky lg:top-14 lg:z-10 lg:bg-slate-50 lg:pb-2 lg:pt-1">
            <SearchBar value={query} onChange={setQuery} />
            <CategoryChips categories={categories} activeSlug={activeCategory} onSelect={setActiveCategory} />
          </div>
          <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} />
        </section>

        <section
          aria-label="Current Sale"
          className={`space-y-4 ${mobileView === 'bill' ? 'block' : 'hidden'} lg:sticky lg:top-[4.75rem] lg:block lg:max-h-[calc(100vh-5.5rem)] lg:self-start lg:overflow-y-auto`}
        >
        <Card>
          <h2 ref={billHeaderRef} className="mb-3 flex items-center gap-2 text-xl font-extrabold text-slate-900">
            <Receipt size={22} className="text-primary-600" /> Bill
            {totalQuantity > 0 && (
              <span className="ml-auto flex items-center justify-center rounded-full bg-primary-100 px-2.5 py-0.5 text-sm font-bold text-primary-700">
                {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
              </span>
            )}
          </h2>

          {lines.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Receipt size={22} />
              </span>
              <p className="text-lg font-semibold text-slate-500">No items in the bill yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {lines.map((line) => (
                <li key={line.productId} className="flex items-center justify-between gap-2 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-lg font-bold text-slate-900">{line.title}</p>
                    <p className="text-base text-slate-600">
                      {formatPeso(line.unitPrice)} × {line.quantity} = {formatPeso(line.unitPrice * line.quantity)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Remove 1 ${line.title}`}
                      onClick={() => incrementLine(line.productId, -1)}
                      className="flex h-touch-min w-touch-min items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-8 text-center text-lg font-bold tabular-nums">{line.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Add 1 ${line.title}`}
                      onClick={() => incrementLine(line.productId, 1)}
                      className="flex h-touch-min w-touch-min items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50"
                    >
                      <Plus size={18} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${line.title}`}
                      onClick={() => removeLine(line.productId)}
                      className="flex h-touch-min w-touch-min items-center justify-center rounded-lg text-danger-600 hover:bg-danger-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="text-xl font-extrabold text-slate-900">Total:</span>
            <span className="text-3xl font-extrabold tabular-nums text-slate-900">{formatPeso(total)}</span>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-xl font-extrabold text-slate-900">Payment Method</h2>
          <PaymentMethodSelector />
        </Card>

        {isUtangSale && (
          <Card className="border-danger-200 bg-danger-50/40">
            <h2 className="mb-3 text-xl font-extrabold text-danger-700">Credit (Utang) Details</h2>
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Customer Name"
                value={utangCustomerName}
                onChange={(event) => setUtangCustomerName(event.target.value)}
              />
              <Input
                type="tel"
                placeholder="Phone Number"
                value={utangCustomerPhone}
                onChange={(event) => setUtangCustomerPhone(event.target.value)}
              />
            </div>
          </Card>
        )}

        <Card>
          <SukliCalculator />
        </Card>

        {error && <p className="rounded-xl bg-danger-50 px-3 py-2 text-sm font-semibold text-danger-700">{error}</p>}
        {demoSuccess && (
          <p className="flex items-center gap-2 rounded-xl bg-success-50 px-3 py-2 text-sm font-semibold text-success-700">
            <CheckCircle2 size={18} /> Demo sale complete! In the real app this would appear in your Sales Report.
          </p>
        )}

        <Button variant="success" size="xl" className="w-full" disabled={!canCompleteSale} onClick={handleCompleteSale}>
          <CheckCircle2 size={22} />
          {isSubmitting ? 'Processing...' : 'Complete Sale'}
        </Button>
      </section>
      </div>

      {flyingDots.map((dot) => (
        <FlyingDot key={dot.id} {...dot} onDone={() => removeFlyingDot(dot.id)} />
      ))}
    </div>
  )
}
