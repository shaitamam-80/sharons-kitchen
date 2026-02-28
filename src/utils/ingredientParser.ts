export interface ParsedIngredient {
  original: string
  quantity: number | null
  unit: string | null
  name: string
  isHeader: boolean
}

const HEBREW_UNITS = [
  'כוסות', 'כוס',
  'כפיות', 'כפית',
  'כפות', 'כף',
  'גרם', 'ק"ג', 'קילו',
  'ליטר', 'מ"ל',
  'חבילות', 'חבילה',
  'שקיות', 'שקית',
  'יחידות', 'יחידה',
]

const FRACTION_MAP: Record<string, number> = {
  '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 0.333, '⅔': 0.667,
  '1½': 1.5, '1¼': 1.25, '1¾': 1.75,
  '2½': 2.5, '2¼': 2.25, '2¾': 2.75,
  '3½': 3.5,
}

const HEADER_PATTERNS = [
  /^ל\S+:/, // "לבצק:", "לקרם:", "למילוי:"
  /^(מילוי|ציפוי|רוטב|קרם|בצק|בסיס|שכבת|תמהיל|תערובת)\b.*:/i,
  /^[^0-9]+:$/, // שורה שכולה כותרת (מסתיימת ב-":" בלבד)
]

export function isGroupHeader(ingredient: string): boolean {
  const trimmed = ingredient.trim()
  return HEADER_PATTERNS.some(p => p.test(trimmed))
}

export function parseIngredient(text: string): ParsedIngredient {
  if (isGroupHeader(text)) {
    return { original: text, quantity: null, unit: null, name: text, isHeader: true }
  }

  const trimmed = text.trim()

  // Try to extract a number at the beginning
  const numMatch = trimmed.match(/^(כ-?)?([\d½¼¾⅓⅔]+(?:[./][\d½¼¾⅓⅔]+)?)\s*(.*)/)
  if (!numMatch) {
    return { original: text, quantity: null, unit: null, name: trimmed, isHeader: false }
  }

  const rawNum = numMatch[2]
  const rest = numMatch[3]

  // Convert number
  let quantity: number | null = FRACTION_MAP[rawNum] ?? parseFloat(rawNum)
  if (isNaN(quantity)) quantity = null

  // Find unit
  let unit: string | null = null
  let name = rest
  for (const u of HEBREW_UNITS) {
    if (rest.startsWith(u + ' ') || rest === u) {
      unit = u
      name = rest.slice(u.length).trim()
      break
    }
  }

  return { original: text, quantity, unit, name: name || trimmed, isHeader: false }
}

export function formatQuantity(num: number): string {
  const fractions: [number, string][] = [
    [0.25, '¼'], [0.333, '⅓'], [0.5, '½'], [0.667, '⅔'], [0.75, '¾'],
  ]
  const whole = Math.floor(num)
  const frac = num - whole
  for (const [val, symbol] of fractions) {
    if (Math.abs(frac - val) < 0.05) {
      return whole > 0 ? `${whole}${symbol}` : symbol
    }
  }
  return num % 1 === 0 ? num.toString() : num.toFixed(1).replace(/\.0$/, '')
}

export function scaleIngredientText(parsed: ParsedIngredient, multiplier: number): string {
  if (parsed.isHeader || parsed.quantity === null || multiplier === 1) {
    return parsed.original
  }
  const scaled = parsed.quantity * multiplier
  const parts = [
    formatQuantity(scaled),
    parsed.unit,
    parsed.name,
  ].filter(Boolean).join(' ')
  return parts
}
