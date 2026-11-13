import type { ClothesLevel, Era, GoalPreset, Goals, PlaceId } from './types'

/** Game constants. Prices are "nutid" kronor; 1994 multiplies them by ERA_PRICE['1994']. */
export const HOURS_PER_WEEK = 60
export const WEEK_START_HOUR = 8 // Monday 08:00
export const HOURS_PER_STEP = 0.5 // walking one place along the ring (basic city)
export const RENT_EVERY = 4 // weeks
export const ERA_PRICE: Record<Era, number> = { '1994': 0.6, nutid: 1 }

export type PlaceInfo = { id: PlaceId; name: string; short: string; tagline: string; opens?: number; closes?: number }

/** Ring order matters: walking time is the shortest way around this list. */
export const PLACES: PlaceInfo[] = [
  { id: 'lagenheten', name: 'Lägenheten', short: 'Hem', tagline: 'Sov, ät och vila.' },
  { id: 'jobbtorget', name: 'Jobbtorget', short: 'Jobb', tagline: 'Sök jobb. Kaffet är gratis, hoppet kostar extra.', closes: 17 },
  { id: 'hogskolan', name: 'Högskolan', short: 'Plugg', tagline: 'Kurser och examina. Pengarna kommer, skulden består.' },
  { id: 'banken', name: 'Banken', short: 'Bank', tagline: 'Ekollonbanken: spara, låna och fonder. Räntan är rörlig, mest uppåt.' },
  { id: 'kvickkop', name: 'Kvickköp', short: 'Mat', tagline: 'Mat för veckan. Gå inte hit hungrig.' },
  { id: 'mobel', name: 'Möbelmagasinet', short: 'Möbler', tagline: 'Platta paket. En insexnyckel blir alltid över.' },
  { id: 'pryl', name: 'Prylpalatset', short: 'Prylar', tagline: 'Elektronik och prylar. 0 kr idag, resten för alltid.' },
  { id: 'bostad', name: 'Bostadsbolaget', short: 'Bostad', tagline: 'Bostadskö och kontrakt.' },
  { id: 'puben', name: 'Puben', short: 'Pub', tagline: 'Gyllene Ekorren: afterwork, quiz och vänner. Öppnar 16.', opens: 16 },
  { id: 'gymmet', name: 'Gymmet', short: 'Gym', tagline: 'Gymmet Svettis: träna bort stressen.' },
]

/** The name players see; it matches the sign on the board. (`era` is kept for places that may differ later.) */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const placeName = (id: PlaceId, era?: Era) => PLACES.find((p) => p.id === id)!.name

export type Job = {
  id: string
  level: number // career ladder 1–9
  name: Record<Era, string>
  place: PlaceId
  wage: number // kr/h nutid
  degrees: string[]
  experience: number // weeks
  clothes: ClothesLevel
  dependability: number
  healthPerShift?: number // health change per 4 h shift
}

export const JOBS: Job[] = [
  { id: 'disk', level: 1, name: { nutid: 'Hyllplockare', '1994': 'Hyllplockare' }, place: 'kvickkop', wage: 130, degrees: [], experience: 0, clothes: 0, dependability: 0 },
  { id: 'lager', level: 2, name: { nutid: 'Lagerarbetare', '1994': 'Lagerarbetare' }, place: 'pryl', wage: 165, degrees: [], experience: 0, clothes: 0, dependability: 0, healthPerShift: -3 },
  { id: 'kassa', level: 3, name: { nutid: 'Kassabiträde', '1994': 'Kassabiträde' }, place: 'kvickkop', wage: 158, degrees: [], experience: 1, clothes: 1, dependability: 10 },
  { id: 'kundtjanst', level: 4, name: { nutid: 'Kundtjänst', '1994': 'Telefonist' }, place: 'banken', wage: 182, degrees: ['gymnasie'], experience: 2, clothes: 1, dependability: 20 },
  { id: 'saljare', level: 5, name: { nutid: 'Säljare', '1994': 'Videobutiksbiträde' }, place: 'pryl', wage: 200, degrees: ['gymnasie'], experience: 4, clothes: 2, dependability: 30 },
  { id: 'handlaggare', level: 6, name: { nutid: 'Handläggare', '1994': 'Sekreterare' }, place: 'jobbtorget', wage: 230, degrees: ['ekonomi'], experience: 10, clothes: 2, dependability: 40 },
  { id: 'projektledare', level: 7, name: { nutid: 'Projektledare', '1994': 'Inköpare' }, place: 'mobel', wage: 310, degrees: ['ekonomi', 'ledarskap'], experience: 20, clothes: 3, dependability: 50 },
  { id: 'mellanchef', level: 8, name: { nutid: 'Mellanchef', '1994': 'Förvaltare' }, place: 'bostad', wage: 365, degrees: ['ledarskap', 'master'], experience: 30, clothes: 3, dependability: 60 },
  { id: 'direktor', level: 9, name: { nutid: 'Bankdirektör', '1994': 'Bankdirektör' }, place: 'banken', wage: 520, degrees: ['ledarskap', 'master'], experience: 40, clothes: 3, dependability: 80 },
]

export type Course = { id: string; name: string; hours: number; fee: number; requires: string[] }

export const COURSES: Course[] = [
  { id: 'gymnasie', name: 'Gymnasiekomplettering', hours: 40, fee: 2000, requires: [] },
  { id: 'ekonomi', name: 'Ekonomiprogrammet', hours: 80, fee: 5000, requires: ['gymnasie'] },
  { id: 'teknik', name: 'Teknikprogrammet', hours: 80, fee: 5000, requires: ['gymnasie'] },
  { id: 'ledarskap', name: 'Ledarskap', hours: 60, fee: 6000, requires: ['gymnasie'] },
  { id: 'master', name: 'Masterexamen', hours: 120, fee: 8000, requires: ['ekonomi', 'ledarskap'] },
]

export type Item = {
  id: string
  name: string
  price: number
  place: PlaceId
  status: number // adds to Status
  happy?: number // adds directly to Lycka (comfort)
  rest?: number // extra health per rest hour at home
  travel?: number // fraction of walking time saved
}

export const ITEMS: Record<Era, Item[]> = {
  nutid: [
    { id: 'smartphone', name: 'Smartphone', price: 12000, place: 'pryl', status: 10 },
    { id: 'tv', name: 'Stor tv med streaming', price: 8000, place: 'pryl', status: 6, happy: 4 },
    { id: 'konsol', name: 'Spelkonsol', price: 6000, place: 'pryl', status: 4, happy: 5 },
    { id: 'cykel', name: 'Elcykel', price: 9000, place: 'pryl', status: 4, travel: 0.25 },
    { id: 'soffa', name: 'Soffa Fluffig', price: 7000, place: 'mobel', status: 4, rest: 1 },
    { id: 'sang', name: 'Säng Drömmo', price: 5000, place: 'mobel', status: 2, rest: 1 },
    { id: 'lampa', name: 'Lampa Ljusglad', price: 400, place: 'mobel', status: 1, happy: 1 },
    { id: 'tavla', name: 'Tavla med älg', price: 900, place: 'mobel', status: 2, happy: 1 },
  ],
  '1994': [
    { id: 'mobil', name: 'Mobiltelefon (stor)', price: 15000, place: 'pryl', status: 12 },
    { id: 'tv', name: 'Färg-tv med text-tv', price: 8000, place: 'pryl', status: 5, happy: 4 },
    { id: 'video', name: 'Videobandspelare', price: 6000, place: 'pryl', status: 4, happy: 5 },
    { id: 'cykel', name: 'Tiväxlad cykel', price: 5000, place: 'pryl', status: 3, travel: 0.25 },
    { id: 'soffa', name: 'Soffa i manchester', price: 7000, place: 'mobel', status: 4, rest: 1 },
    { id: 'sang', name: 'Vattensäng', price: 6000, place: 'mobel', status: 3, rest: 1 },
    { id: 'lampa', name: 'Lavalampa', price: 400, place: 'mobel', status: 1, happy: 1 },
    { id: 'tavla', name: 'Affisch med delfiner', price: 300, place: 'mobel', status: 1, happy: 1 },
  ],
}

export const CLOTHES: { level: ClothesLevel; name: string; price: number; weeks: number }[] = [
  { level: 1, name: 'Vardagskläder', price: 1500, weeks: 12 },
  { level: 2, name: 'Snygga kläder', price: 4000, weeks: 10 },
  { level: 3, name: 'Kostym', price: 9000, weeks: 8 },
]
export const CLOTHES_NAME = ['Trasiga kläder', 'Vardagskläder', 'Snygga kläder', 'Kostym'] as const

export const HOUSING = {
  andrahand: { name: 'Andrahandsetta', rent: 9500 },
  hyresratt: { name: 'Hyresrätt', rent: 7400 },
  bostadsratt: { name: 'Bostadsrätt', rent: 4000 }, // monthly fee; mortgage interest on top
  soffa: { name: 'Kompisens soffa', rent: 0 },
} as const
export const QUEUE_POINTS_NEEDED = 30
export const BRF_PRICE = 2_000_000
export const BRF_DOWN = 0.15

export const FOOD_PRICE = 900
export const GYM_CARD = 3000
export const GYM_DAYPASS = 120
export const INSURANCE_WEEKLY = 149
export const INTEREST = {
  nutid: { save: 0.01, loan: 0.09, mortgage: 0.04 },
  '1994': { save: 0.06, loan: 0.11, mortgage: 0.1 },
} as const

export const GOAL_PRESETS: Record<GoalPreset, Goals> = {
  kort: { money: 30_000, education: 1, career: 4, relations: 50, happiness: 50 },
  mellan: { money: 200_000, education: 2, career: 6, relations: 65, happiness: 65 },
  lang: { money: 500_000, education: 4, career: 8, relations: 80, happiness: 80 },
}

export const PLAYER_COLORS = ['#E07A35', '#2B5C8A', '#9C4FD6', '#2F8F5B']

/** Weekend activities: what cash in the pocket turns into. {x} = amount. */
export const WEEKENDS: Record<Era, string[]> = {
  nutid: [
    'Du gick på loppis och kom hem med en hängmatta du inte får plats med.',
    'Spontan tågresa till Göteborg. Tåget stod still i Hallsberg i tre timmar.',
    'Du beställde hämtmat tre kvällar i rad. Budet hälsade på dig med namn.',
    'Brunch med vänner. Avokadon kostade mer än din frukost hela veckan.',
    'Du köpte en surdegsgrund och glömde den i kylen.',
    'Konsert i parken. Biljetten var gratis, ölen var det inte.',
  ],
  '1994': [
    'Du hyrde fem filmer på videobutiken och glömde lämna tillbaka dem. Förseningsavgift.',
    'Disco på Hasses Hak. Du dansade till Dr. Alban hela natten.',
    'Du köpte en Walkman-kassett med Ace of Base. Och en till, för säkerhets skull.',
    'Pizza och läsk med kompisarna. Någon spillde Jolt Cola på mattan.',
    'Du åkte färja till Åland för att handla taxfree.',
    'Du ringde 071-nummer. Vi pratar inte om det.',
  ],
}

/** Egon's comments in his weekly summary. */
export const EGON_QUIPS = [
  'Fjortonde lampan. Den här är annorlunda.',
  'Jag jobbade, åt och köpte en tavla. Livet är enkelt.',
  'Ekollon är en valuta. Banken håller inte med.',
  'Jag har en plan. Den innehåller möbler.',
  'Vem behöver ett skrivbord? Jag. Jag behöver tre.',
  'Ni ser trötta ut. Har ni provat att samla på saker?',
]
