import attackCover from './components/assets/attack-cover.jpg'
import attackBanner from './components/assets/attack-banner.jpg'
import chainsawCover from './components/assets/chainsaw-cover.jpg'
import chainsawBanner from './components/assets/chainsaw-banner.jpg'
import jujutsuCover from './components/assets/jujutsu-cover.jpg'
import jujutsuBanner from './components/assets/jujutsu-banner.jpg'

export type Manga = {
  slug: string
  title: string
  description: string
  status: string
  genres: string[]
  cover: string
  banner: string
  accent: string
  author: string
  publisher: string
  officialUrl: string
  year: number
  endYear?: number
  chapters: number
  rating: number
  apiId?: string
}

export const manga: Manga[] = [
  {
    slug: 'attack',
    title: 'Attack on Titan',
    description: 'After his hometown is destroyed, Eren Jaeger vows to cleanse the earth of the Titans that brought humanity to the brink of extinction.',
    status: 'Completed',
    genres: ['Dark fantasy', 'Action'],
    cover: attackCover,
    banner: attackBanner,
    accent: '#d66d44',
    author: 'Hajime Isayama',
    publisher: 'Kodansha',
    officialUrl: 'https://kodansha.us/series/attack-on-titan/',
    year: 2009,
    endYear: 2021,
    chapters: 89,
    rating: 4.8,
  },
  {
    slug: 'chainsaw',
    title: 'Chainsaw Man',
    description: 'Burdened by debt, Denji survives by hunting Devils with Pochita—until one brutal betrayal transforms everything.',
    status: 'Ongoing',
    genres: ['Action', 'Horror'],
    cover: chainsawCover,
    banner: chainsawBanner,
    accent: '#e9a527',
    author: 'Tatsuki Fujimoto',
    publisher: 'VIZ Media',
    officialUrl: 'https://www.viz.com/shonenjump/chapters/chainsaw-man',
    year: 2018,
    chapters: 125,
    rating: 4.6,
  },
  {
    slug: 'jujutsu',
    title: 'Jujutsu Kaisen',
    description: 'In a world where Cursed Spirits prey on humanity, Yuji Itadori is pulled into a secret war after swallowing a forbidden object.',
    status: 'Completed',
    genres: ['Supernatural', 'Adventure'],
    cover: jujutsuCover,
    banner: jujutsuBanner,
    accent: '#8a72d6',
    author: 'Gege Akutami',
    publisher: 'VIZ Media',
    officialUrl: 'https://www.viz.com/shonenjump/chapters/jujutsu-kaisen',
    year: 2018,
    endYear: 2024,
    chapters: 244,
    rating: 4.7,
  },
]

export function getMangaBySlug(slug: string | undefined) {
  return manga.find((item) => item.slug === slug)
}

export const allGenres = [...new Set(manga.flatMap((item) => item.genres))].sort()
