import assert from 'node:assert/strict'
import test from 'node:test'
import { addMonthsToDateStr, buildInstallmentSchedule } from '../app/lib/installments.ts'

test('adds monthly installments while preserving the due day and clamping month ends', () => {
  assert.equal(addMonthsToDateStr('2025-01-31', 1, 31), '2025-02-28')
  assert.equal(addMonthsToDateStr('2025-01-31', 2, 31), '2025-03-31')
})

test('splits cents into the first installment and dates every installment', () => {
  assert.deepEqual(buildInstallmentSchedule(700, 4, '2025-04-10', 10), [
    { number: 1, amount: 175, dueDate: '2025-04-10' },
    { number: 2, amount: 175, dueDate: '2025-05-10' },
    { number: 3, amount: 175, dueDate: '2025-06-10' },
    { number: 4, amount: 175, dueDate: '2025-07-10' },
  ])
  assert.deepEqual(buildInstallmentSchedule(100, 3, '2025-01-15').map(item => item.amount), [33.34, 33.33, 33.33])
})

test('rejects invalid installment counts, amounts, and dates', () => {
  assert.throws(() => buildInstallmentSchedule(100, 13, '2025-01-15'), /entre 1 e 12/)
  assert.throws(() => buildInstallmentSchedule(0, 2, '2025-01-15'), /valor total válido/)
  assert.throws(() => buildInstallmentSchedule(100, 2, '2025-02-30'), /Data inválida/)
})