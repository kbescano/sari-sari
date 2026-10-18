'use client'

import { useEffect, useRef, useState } from 'react'
import { Receipt, Minus, Plus, Trash2, CheckCircle2, ShoppingBasket, ChevronUp, ScanLine } from 'lucide-react'
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
import { BarcodeScannerModal } from '@/components/shared/BarcodeScannerModal'
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
      className="pointer-events-none fixed z-50 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white shadow-card-hover transition-[transform,opacity] duration-500 ease-[var(--ease-out-snap)]"
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
  const [isBillSheetOpen, setIsBillSheetOpen] = useState(false)
  const billToggleRef = useRef<HTMLButtonElement>(null)
  const desktopBillRef = useRef<HTMLElement>(null)
  const [flyingDots, setFlyingDots] = useState<FlyingDotData[]>([])
  const nextFlyingDotId = useRef(0)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
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
  const addLine = usePosCart((state) => state.addLine)
  const isUtangEnabled = useIsUtangEnabled()
  const isDemo = useDemoMode((state) => state.isDemo)

  const [utangCustomerName, setUtangCustomerName] = useState('')
  const [utangCustomerPhone, setUtangCustomerPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [demoSuccess, setDemoSuccess] = useState(false)
  const [lastOrderId, setLastOrderId] = useState<number | null>(null)

  const isUtangSale = isUtangEnabled && paymentMethod === 'Credit/Utang'
  const hasCashShortfall = paymentMethod === 'Cash' && (cashTendered ?? 0) < total
  const isUtangDetailsMissing = isUtangSale && (!utangCustomerName.trim() || !utangCustomerPhone.trim())

  const canCompleteSale =
    lines.length > 0 && !isSubmitting && !(paymentMethod === 'Cash' && hasCashShortfall) && !isUtangDetailsMissing

  function handleAddToCart(rect: DOMRect) {
    const targetEl =
      billToggleRef.current && billToggleRef.current.offsetParent !== null ? billToggleRef.current : desktopBillRef.current
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

  function handleBarcodeDetected(code: string) {
    setIsScannerOpen(false)
    const product = products.find((candidate) => candidate.barcode && candidate.barcode === code)
    if (!product) {
      setScanError(`No product matches barcode "${code}".`)
      return
    }
    if (product.stockQuantity <= 0) {
      setScanError(`"${product.title}" is out of stock.`)
      return
    }
    setScanError(null)
    addLine({
      productId: product.id,
      title: product.title,
      unitPrice: product.sellingPrice,
      unitType: product.unitType,
    })
  }

  async function handleCompleteSale() {
    setIsSubmitting(true)
    setError(null)
    setLastOrderId(null)

    // Demo accounts never reach the real server action — the sale is purely simulated
    // client-side, so nothing is ever written to real store data (see assertNotDemo() in
    // src/lib/auth.ts for the server-side backstop if this were ever bypassed).
    if (isDemo) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      clearSale()
      setUtangCustomerName('')
      setUtangCustomerPhone('')
      setIsBillSheetOpen(false)
      setIsSubmitting(false)
      setDemoSuccess(true)
      setTimeout(() => setDemoSuccess(false), 3000)
      return
    }

    try {
      const order = await createPosOrder({
        items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity, unitPrice: line.unitPrice })),
        totalAmount: total,
        paymentMethod,
        customerName: isUtangSale ? utangCustomerName : 'Walk-in Customer',
        customerPhone: isUtangSale ? utangCustomerPhone : 'N/A',
      })
      clearSale()
      setUtangCustomerName('')
      setUtangCustomerPhone('')
      setIsBillSheetOpen(false)
      setLastOrderId(order.id)
    } catch {
      setError('Could not complete the sale. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const billCards = (
    <>
      <Card>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900">
          <Receipt size={18} className="text-primary-600" /> Bill
          {totalQuantity > 0 && (
            <span className="ml-auto flex items-center justify-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
              {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
            </span>
          )}
        </h2>

        {lines.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <Receipt size={18} />
            </span>
            <p className="text-sm font-semibold text-slate-500">No items in the bill yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {lines.map((line) => (
              <li key={line.productId} className="flex items-center justify-between gap-2 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-semibold text-slate-900">{line.title}</p>
                  <p className="text-xs text-slate-500">
                    {formatPeso(line.unitPrice)} × {line.quantity} = {formatPeso(line.unitPrice * line.quantity)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label={`Remove 1 ${line.title}`}
                    onClick={() => incrementLine(line.productId, -1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 transition-[background-color,transform] duration-150 ease-[var(--ease-out-snap)] hover:bg-slate-50 active:scale-[0.97]"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold tabular-nums">{line.quantity}</span>
                  <button
                    type="button"
                    aria-label={`Add 1 ${line.title}`}
                    onClick={() => incrementLine(line.productId, 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 transition-[background-color,transform] duration-150 ease-[var(--ease-out-snap)] hover:bg-slate-50 active:scale-[0.97]"
                  >
                    <Plus size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${line.title}`}
                    onClick={() => removeLine(line.productId)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-danger-600 transition-[background-color,transform] duration-150 ease-[var(--ease-out-snap)] hover:bg-danger-50 active:scale-[0.97]"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
          <span className="text-base font-bold text-slate-900">Total:</span>
          <span className="text-2xl font-extrabold tabular-nums text-slate-900">{formatPeso(total)}</span>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-bold text-slate-900">Payment Method</h2>
        <PaymentMethodSelector />
      </Card>

      {isUtangSale && (
        <Card className="border-danger-200 bg-danger-50/40">
          <h2 className="mb-3 text-lg font-bold text-danger-700">Credit (Utang) Details</h2>
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
          <CheckCircle2 size={16} /> Demo sale complete! In the real app this would appear in your Sales Report.
        </p>
      )}
      {lastOrderId !== null && (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-success-50 px-3 py-2 text-sm font-semibold text-success-700">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} /> Sale complete!
          </span>
          <a
            href={`/receipt/${lastOrderId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg bg-success-600 px-3 py-1.5 text-xs text-white transition-[background-color,transform] duration-150 ease-[var(--ease-out-snap)] hover:bg-success-700 active:scale-[0.97]"
          >
            <Receipt size={13} /> Print Receipt
          </a>
        </div>
      )}

      <Button variant="success" size="xl" className="w-full" disabled={!canCompleteSale} onClick={handleCompleteSale}>
        <CheckCircle2 size={18} />
        {isSubmitting ? 'Processing...' : 'Complete Sale'}
      </Button>
    </>
  )

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section aria-label="Products" className="space-y-3 pb-36 sm:pb-24 lg:pb-0">
          <div className="space-y-3 lg:sticky lg:top-14 lg:z-10 lg:bg-slate-50 lg:pb-2 lg:pt-1">
            <div className="flex gap-2">
              <div className="flex-1">
                <SearchBar value={query} onChange={setQuery} />
              </div>
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                aria-label="Scan a barcode to add it to the bill"
                className="flex h-touch-lg w-touch-lg shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition-[background-color,transform] duration-150 ease-[var(--ease-out-snap)] hover:bg-slate-800 active:scale-[0.97]"
              >
                <ScanLine size={18} />
              </button>
            </div>
            {scanError && (
              <p className="rounded-xl bg-danger-50 px-3 py-2 text-sm font-semibold text-danger-700">{scanError}</p>
            )}
            <CategoryChips categories={categories} activeSlug={activeCategory} onSelect={setActiveCategory} />
          </div>
          <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} />
        </section>

        {/* Desktop: the bill is a static sidebar, always in view — no peek/expand needed. */}
        <section
          ref={desktopBillRef}
          aria-label="Current Sale"
          className="hidden space-y-4 lg:sticky lg:top-[4.75rem] lg:block lg:max-h-[calc(100vh-5.5rem)] lg:self-start lg:overflow-y-auto"
        >
          {billCards}
        </section>
      </div>

      {/* Mobile: the bill total rides along as a persistent peek bar, tap (or drag the
          handle) to expand into the full bill — the running total stays ambient context
          while browsing products instead of forcing a tab switch to check it. */}
      <button
        ref={billToggleRef}
        type="button"
        aria-expanded={isBillSheetOpen}
        onClick={() => setIsBillSheetOpen(true)}
        className={`fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 flex h-touch-lg items-center gap-3 rounded-xl bg-slate-900 px-3.5 text-white shadow-card-hover transition-[transform,opacity] duration-200 ease-[var(--ease-out-snap)] active:scale-[0.98] sm:bottom-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden ${
          isBillSheetOpen ? 'pointer-events-none translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <span className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/15">
          <ShoppingBasket size={16} />
          {totalQuantity > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] font-bold text-white">
              {totalQuantity}
            </span>
          )}
        </span>
        <span className="flex-1 text-left text-sm font-semibold leading-tight">
          {totalQuantity > 0 ? `${totalQuantity} ${totalQuantity === 1 ? 'item' : 'items'}` : 'Bill'}
        </span>
        <span className="text-base font-bold tabular-nums">{formatPeso(total)}</span>
        <ChevronUp size={16} className="flex-shrink-0 text-white/70" />
      </button>

      <div
        aria-hidden={!isBillSheetOpen}
        onClick={() => setIsBillSheetOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-900/40 transition-opacity duration-200 ease-[var(--ease-out-snap)] lg:hidden ${
          isBillSheetOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Current Sale"
        className={`fixed inset-x-0 bottom-0 z-50 max-h-[88vh] rounded-t-3xl bg-slate-50 shadow-card-hover transition-transform duration-300 ease-[var(--ease-out-snap)] lg:hidden ${
          isBillSheetOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <button
          type="button"
          onClick={() => setIsBillSheetOpen(false)}
          aria-label="Collapse bill"
          className="flex w-full items-center justify-center py-3"
        >
          <span className="h-1.5 w-12 rounded-full bg-slate-300" />
        </button>
        <div
          className="max-h-[calc(88vh-2.5rem)] space-y-4 overflow-y-auto px-4"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          {billCards}
        </div>
      </div>

      {flyingDots.map((dot) => (
        <FlyingDot key={dot.id} {...dot} onDone={() => removeFlyingDot(dot.id)} />
      ))}

      {isScannerOpen && (
        <BarcodeScannerModal onDetected={handleBarcodeDetected} onClose={() => setIsScannerOpen(false)} />
      )}
    </div>
  )
}
