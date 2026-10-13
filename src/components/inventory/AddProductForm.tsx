'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { PackagePlus, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Label, Select } from '@/components/ui/Input'
import { MarkupPricingFields } from './MarkupPricingFields'
import { createProductAction, type CreateProductState } from '@/app/(frontend)/(app)/inventory/actions'

const initialState: CreateProductState = { error: null, success: false }

export function AddProductForm({ categories }: { categories: { id: number; name: string }[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(createProductAction, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
      setIsOpen(false)
    }
  }, [state.success])

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)}>
        <PackagePlus size={20} />
        Add Product
      </Button>
    )
  }

  return (
    <Card className="border-primary-200">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
          <PackagePlus size={22} className="text-primary-600" /> Add Product
        </h2>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close"
          className="flex h-touch-min w-touch-min items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
        >
          <X size={20} />
        </button>
      </div>

      <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="title">Product Name</Label>
          <Input id="title" name="title" required placeholder="e.g. Instant Noodles" />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select id="category" name="category" required defaultValue="">
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="unitType">Unit</Label>
          <Select id="unitType" name="unitType" defaultValue="piece">
            <option value="piece">Piece</option>
            <option value="pack">Pack</option>
            <option value="sachet">Sachet</option>
          </Select>
        </div>

        <MarkupPricingFields />

        <div className="sm:col-span-2">
          <Label htmlFor="stockQuantity">Starting Stock</Label>
          <Input id="stockQuantity" name="stockQuantity" type="number" min={0} defaultValue={0} />
        </div>

        {state.error && (
          <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm font-semibold text-danger-700 sm:col-span-2">
            {state.error}
          </p>
        )}

        <Button type="submit" size="xl" className="sm:col-span-2" disabled={isPending}>
          {isPending ? 'Adding...' : 'Add Product'}
        </Button>
      </form>
    </Card>
  )
}
