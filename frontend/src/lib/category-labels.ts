const CATEGORY_LABELS: Record<string, string> = {
  beauty: 'Güzellik',
  fragrances: 'Parfüm',
  furniture: 'Mobilya',
  groceries: 'Market',
  'home-decoration': 'Ev dekorasyonu',
  'kitchen-accessories': 'Mutfak aksesuarları',
  laptops: 'Dizüstü bilgisayar',
  'mens-shirts': 'Erkek gömlek',
  'mens-shoes': 'Erkek ayakkabı',
  'mens-watches': 'Erkek saat',
  'mobile-accessories': 'Mobil aksesuar',
  motorcycle: 'Motosiklet',
  'skin-care': 'Cilt bakımı',
  smartphones: 'Akıllı telefon',
  'sports-accessories': 'Spor aksesuarları',
  sunglasses: 'Güneş gözlüğü',
  tablets: 'Tablet',
  tops: 'Üst giyim',
  vehicle: 'Araç',
  'womens-bags': 'Kadın çanta',
  'womens-dresses': 'Kadın elbise',
  'womens-jewellery': 'Kadın takı',
  'womens-shoes': 'Kadın ayakkabı',
  'womens-watches': 'Kadın saat',
}

function toTitleCase(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
    .join(' ')
}

export function formatCategoryLabel(category: string) {
  const normalizedCategory = category.trim().toLowerCase()

  if (!normalizedCategory) {
    return ''
  }

  const mappedLabel = CATEGORY_LABELS[normalizedCategory]
  if (mappedLabel) {
    return mappedLabel
  }

  return toTitleCase(normalizedCategory.replace(/-/g, ' '))
}
