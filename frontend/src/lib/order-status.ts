const ORDER_STATUS_LABELS: Record<string, string> = {
  COMPLETED: 'Tamamlandı',
  PENDING: 'Beklemede',
  PAID: 'Ödendi',
  CREATED: 'Oluşturuldu',
  CANCELLED: 'İptal edildi',
  FAILED: 'Başarısız',
  PROCESSING: 'İşleniyor',
}

export function formatOrderStatus(status: string) {
  const normalizedStatus = status.trim().toUpperCase()

  if (!normalizedStatus) {
    return 'Belirsiz'
  }

  return ORDER_STATUS_LABELS[normalizedStatus] ?? normalizedStatus
}
