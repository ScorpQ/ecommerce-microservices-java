export const IYZICO_TEST_CARD = {
  cardHolderName: import.meta.env.VITE_IYZICO_CARD_HOLDER_NAME ?? 'Cansi Test',
  cardNumber: import.meta.env.VITE_IYZICO_CARD_NUMBER ?? '5528790000000008',
  expireMonth: import.meta.env.VITE_IYZICO_EXPIRE_MONTH ?? '12',
  expireYear: import.meta.env.VITE_IYZICO_EXPIRE_YEAR ?? '2030',
  cvc: import.meta.env.VITE_IYZICO_CVC ?? '123',
}
