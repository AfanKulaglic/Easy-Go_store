export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  category: string
  categorySlug: string
  image: string
  description: string
  rating: number
  reviews: number
  badge?: 'sale' | 'new' | 'discount'
  discountPercent?: number
  soldPercent?: number
  isFlashDeal?: boolean
  colors?: string[]
  features?: string[]
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
}

export const categories: Category[] = [
  { id: '1', name: 'Wifi Kamere', slug: 'wifi-kamere', icon: 'camera' },
  { id: '2', name: 'Noćni binokulari', slug: 'nocni-binokulari', icon: 'binoculars' },
  { id: '3', name: 'Projektori', slug: 'projektori', icon: 'projector' },
  { id: '4', name: 'Smart Home', slug: 'smart-home', icon: 'home' },
  { id: '5', name: 'Audio', slug: 'audio', icon: 'headphones' },
  { id: '6', name: 'Gadgeti', slug: 'gadgeti', icon: 'smartphone' },
  { id: '7', name: 'Outdoor', slug: 'outdoor', icon: 'tent' },
  { id: '8', name: 'Rasprodaja', slug: 'rasprodaja', icon: 'tag' },
]

export const products: Product[] = [
  {
    id: '1',
    name: 'JOOAN 3MP Solarna Sigurnosna Kamera Bežična Wifi 2K',
    price: 129.90,
    category: 'Wifi Kamere',
    categorySlug: 'wifi-kamere',
    image: '📷',
    description: 'JOOAN 3MP solarna sigurnosna kamera sa bežičnom WiFi vezom. Rezolucija 2K za kristalno jasnu sliku. Solarna ploča za neprekidno napajanje. Idealna za vanjsku upotrebu, otporna na vremenske uvjete. Dvosmjerna audio komunikacija i noćni vid.',
    rating: 4.8,
    reviews: 24,
    badge: 'new',
    colors: ['#1A1A1A', '#FFFFFF'],
    features: ['3MP rezolucija', 'Solarna ploča', 'WiFi povezivanje', 'Noćni vid', 'IP66 vodootporno'],
  },
  {
    id: '2',
    name: 'Solarna mini nadzorna kamera Wifi sigurnosna HEIYOUCAM Full HD',
    price: 89.90,
    category: 'Wifi Kamere',
    categorySlug: 'wifi-kamere',
    image: '📹',
    description: 'Kompaktna solarna mini nadzorna kamera HEIYOUCAM sa Full HD rezolucijom. Jednostavna instalacija bez kablova. Detekcija pokreta sa instant obavijestima na mobitel. Pohrana na SD karticu ili cloud.',
    rating: 4.6,
    reviews: 18,
    colors: ['#1A1A1A', '#FFFFFF'],
    features: ['Full HD 1080p', 'Mini dizajn', 'Detekcija pokreta', 'Cloud pohrana', 'Solarna ploča'],
  },
  {
    id: '3',
    name: 'Solarna Vanjska Sigurnosna Kamera dva objektiva WIFI',
    price: 109.90,
    category: 'Wifi Kamere',
    categorySlug: 'wifi-kamere',
    image: '🎥',
    description: 'Napredna solarna vanjska sigurnosna kamera sa dva objektiva za širi kut snimanja. WiFi povezivanje za jednostavan pristup putem aplikacije. Automatsko praćenje pokreta i sirena za odvraćanje.',
    rating: 4.7,
    reviews: 31,
    badge: 'new',
    colors: ['#1A1A1A'],
    features: ['Dva objektiva', '360° pokrivenost', 'Auto tracking', 'Sirena', 'Solarna ploča'],
  },
  {
    id: '4',
    name: 'Noćni binokular 4K Night Vision 2MP 10x Zoom',
    price: 119.90,
    originalPrice: 179.90,
    category: 'Noćni binokulari',
    categorySlug: 'nocni-binokulari',
    image: '🔭',
    description: 'Profesionalni noćni binokular sa 4K rezolucijom i 10x optičkim zumom. Infracrveni LED za vidljivost do 300m u potpunom mraku. Snimanje videa i fotografija. Idealan za lov, promatranje prirode i sigurnost.',
    rating: 4.9,
    reviews: 42,
    badge: 'sale',
    discountPercent: 33,
    isFlashDeal: true,
    soldPercent: 78,
    colors: ['#1A1A1A', '#2D5016'],
    features: ['4K rezolucija', '10x zoom', 'Noćni vid 300m', 'Snimanje videa', 'Punjiva baterija'],
  },
  {
    id: '5',
    name: 'Projektor HY320 Mini Full HD 1080P s ugrađenim zvučnicima',
    price: 99.90,
    originalPrice: 149.90,
    category: 'Projektori',
    categorySlug: 'projektori',
    image: '📽️',
    description: 'Kompaktni mini projektor HY320 sa Full HD 1080P rezolucijom. Ugrađeni stereo zvučnici za kompletan audio-vizualni doživljaj. HDMI, USB i WiFi povezivanje. Idealan za kućno kino, prezentacije i gaming.',
    rating: 4.5,
    reviews: 67,
    badge: 'sale',
    discountPercent: 33,
    isFlashDeal: true,
    soldPercent: 85,
    colors: ['#FFFFFF', '#1A1A1A'],
    features: ['Full HD 1080P', 'Ugrađeni zvučnici', 'WiFi', 'HDMI/USB', 'Keystone korekcija'],
  },
  {
    id: '6',
    name: 'Mini projektor S320 4K Smart Android 12 Wifi',
    price: 129.90,
    category: 'Projektori',
    categorySlug: 'projektori',
    image: '🎬',
    description: 'Smart mini projektor S320 sa 4K podrškom i Android 12 operativnim sistemom. Pristup Netflix, YouTube i drugim aplikacijama direktno sa projektora. Dual-band WiFi za stabilno streamanje.',
    rating: 4.7,
    reviews: 38,
    badge: 'new',
    colors: ['#FFFFFF', '#1A1A1A', '#C0C0C0'],
    features: ['4K podrška', 'Android 12', 'Smart TV apps', 'Dual WiFi', 'Bluetooth'],
  },
  {
    id: '7',
    name: 'Magcubic L018 Prijenosni Projektor 4K',
    price: 159.90,
    originalPrice: 219.90,
    category: 'Projektori',
    categorySlug: 'projektori',
    image: '🖥️',
    description: 'Premium prijenosni projektor Magcubic L018 sa pravom 4K rezolucijom. Ultra svijetla LED lampa sa 15000 lumena. Automatski fokus i keystone korekcija. Kompaktan dizajn idealan za putovanja.',
    rating: 4.8,
    reviews: 29,
    badge: 'sale',
    discountPercent: 27,
    isFlashDeal: true,
    soldPercent: 62,
    colors: ['#FFFFFF', '#1A1A1A'],
    features: ['4K native', '15000 lumena', 'Auto fokus', 'Prijenosni', 'HDR10'],
  },
  {
    id: '8',
    name: 'Noćni Binokular 4K Night Vision 5000mAh Novi Model',
    price: 149.90,
    originalPrice: 189.90,
    category: 'Noćni binokulari',
    categorySlug: 'nocni-binokulari',
    image: '🌙',
    description: 'Najnoviji model noćnog binokulara sa 4K rezolucijom i velikom 5000mAh baterijom za cjelodnevnu upotrebu. Poboljšani infracrveni senzor za jasniju sliku u mraku. WiFi prijenos na mobitel.',
    rating: 4.9,
    reviews: 15,
    badge: 'sale',
    discountPercent: 21,
    isFlashDeal: true,
    soldPercent: 45,
    colors: ['#1A1A1A', '#2D5016'],
    features: ['4K rezolucija', '5000mAh baterija', 'WiFi prijenos', 'Novi IR senzor', '32GB memorija'],
  },
  {
    id: '9',
    name: 'Noćni Lovački Binokular 4K 10x Zoom sa kompasom i svjetlom',
    price: 139.90,
    category: 'Noćni binokulari',
    categorySlug: 'nocni-binokulari',
    image: '🔦',
    description: 'Specijalizirani lovački noćni binokular sa ugrađenim kompasom i LED svjetlom. 4K rezolucija sa 10x digitalnim zumom. Robusno kućište otporno na udarce i vodu. Idealan za lovce i outdoor entuzijaste.',
    rating: 4.6,
    reviews: 22,
    badge: 'new',
    colors: ['#2D5016', '#1A1A1A'],
    features: ['4K 10x zoom', 'Ugrađeni kompas', 'LED svjetlo', 'IP67 vodootporno', 'Shock-proof'],
  },
]

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id)
}

export const getProductsByCategory = (categorySlug: string): Product[] => {
  return products.filter(p => p.categorySlug === categorySlug)
}

export const getFlashDeals = (): Product[] => {
  return products.filter(p => p.isFlashDeal)
}

export const getRelatedProducts = (productId: string, limit = 4): Product[] => {
  const product = getProductById(productId)
  if (!product) return products.slice(0, limit)
  
  return products
    .filter(p => p.id !== productId && p.categorySlug === product.categorySlug)
    .slice(0, limit)
}

export const getFeaturedProducts = (limit = 6): Product[] => {
  return products.slice(0, limit)
}

export const getBestSellers = (limit = 4): Product[] => {
  return [...products]
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, limit)
}

export const customerReviews = [
  {
    id: '1',
    productId: '1',
    name: 'Marko P.',
    date: '12 Dec 2024',
    rating: 5,
    comment: 'Odlična kamera! Slika je kristalno jasna, a solarna ploča radi savršeno.',
    avatar: '👨',
    images: ['📷'],
  },
  {
    id: '2',
    productId: '1',
    name: 'Ana K.',
    date: '8 Dec 2024',
    rating: 5,
    comment: 'Vrlo zadovoljna kupovinom. Jednostavna instalacija i odlična kvaliteta.',
    avatar: '👩',
    images: ['📷', '📱'],
  },
  {
    id: '3',
    productId: '1',
    name: 'Ivan M.',
    date: '28 Nov 2024',
    rating: 4,
    comment: 'Dobar proizvod za tu cijenu. Preporučujem!',
    avatar: '👨',
    images: [],
  },
]
