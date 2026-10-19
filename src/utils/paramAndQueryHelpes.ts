


export const strFromQueryOrParams = (val: string | (string | null)[] | null | undefined): string => {
    if (!val) return ''
    if (typeof val === 'string') return val
    if (Array.isArray(val)) return val[0] ?? ''
    return ''
}

export const toNumber = (val: unknown): number | null => {
    if (val === undefined || val === null || val === '') return null

    const target = Array.isArray(val) ? val[0] : val
    const parsed = Number(target)

    // التأكد من أن الناتج رقم صالح وليس NaN
    return Number.isNaN(parsed) ? null : parsed
}