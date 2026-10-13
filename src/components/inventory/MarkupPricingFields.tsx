'use client'

import { useState } from 'react'
import { Label, Input, Select } from '@/components/ui/Input'
import { formatPeso } from '@/lib/currency'

export type MarkupType = 'percentage' | 'fixed'

export function MarkupPricingFields({
  defaultCostPrice = 0,
  defaultMarkupType = 'percentage',
  defaultMarkupValue = 0,
}: {
  defaultCostPrice?: number
  defaultMarkupType?: MarkupType
  defaultMarkupValue?: number
}) {
  const [costPrice, setCostPrice] = useState(defaultCostPrice)
  const [markupType, setMarkupType] = useState<MarkupType>(defaultMarkupType)
  const [markupValue, setMarkupValue] = useState(defaultMarkupValue)

  const markup = markupType === 'fixed' ? markupValue : costPrice * (markupValue / 100)
  const sellingPrice = costPrice + markup

  return (
    <>
      <div>
        <Label htmlFor="costPrice">Cost Price (₱)</Label>
        <Input
          id="costPrice"
          name="costPrice"
          type="number"
          step="0.01"
          min={0}
          value={costPrice}
          onChange={(event) => setCostPrice(Number(event.target.value) || 0)}
        />
      </div>

      <div>
        <Label htmlFor="markupType">Markup Type</Label>
        <Select
          id="markupType"
          name="markupType"
          value={markupType}
          onChange={(event) => setMarkupType(event.target.value as MarkupType)}
        >
          <option value="percentage">Percentage (%)</option>
          <option value="fixed">Fixed Amount (₱)</option>
        </Select>
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="markupValue">Markup {markupType === 'percentage' ? '(%)' : '(₱)'}</Label>
        <Input
          id="markupValue"
          name="markupValue"
          type="number"
          step="0.01"
          min={0}
          value={markupValue}
          onChange={(event) => setMarkupValue(Number(event.target.value) || 0)}
        />
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-primary-50 px-4 py-3 sm:col-span-2">
        <span className="text-base font-bold text-primary-700">Selling Price</span>
        <span className="text-xl font-extrabold tabular-nums text-primary-700">{formatPeso(sellingPrice)}</span>
      </div>
    </>
  )
}
