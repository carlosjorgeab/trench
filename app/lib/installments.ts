export interface InstallmentScheduleItem {
  number: number
  amount: number
  dueDate: string
}

export function addMonthsToDateStr(dateStr: string, monthsToAdd: number, targetDay?: number | null): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  if (!match || !Number.isInteger(monthsToAdd)) {
    throw new Error('Data ou quantidade de meses inválida.')
  }

  const [, yearText, monthText, dayText] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error('Data inválida.')
  }

  const targetMonthIndex = month - 1 + monthsToAdd
  const targetYear = year + Math.floor(targetMonthIndex / 12)
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12
  const lastDayOfMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate()
  const requestedDay = targetDay ?? day
  if (!Number.isInteger(requestedDay) || requestedDay < 1 || requestedDay > 31) {
    throw new Error('Dia de vencimento inválido.')
  }
  const dueDay = Math.min(requestedDay, lastDayOfMonth)

  return `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(dueDay).padStart(2, '0')}`
}

export function buildInstallmentSchedule(
  totalAmount: number,
  installmentCount: number,
  firstDueDate: string,
  dueDay?: number | null
): InstallmentScheduleItem[] {
  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    throw new Error('Informe um valor total válido.')
  }
  if (!Number.isInteger(installmentCount) || installmentCount < 1 || installmentCount > 12) {
    throw new Error('O número de parcelas deve estar entre 1 e 12.')
  }

  const totalCents = Math.round(totalAmount * 100)
  const baseCents = Math.floor(totalCents / installmentCount)
  const firstInstallmentCents = baseCents + (totalCents - baseCents * installmentCount)

  return Array.from({ length: installmentCount }, (_, index) => ({
    number: index + 1,
    amount: (index === 0 ? firstInstallmentCents : baseCents) / 100,
    dueDate: addMonthsToDateStr(firstDueDate, index, dueDay),
  }))
}
