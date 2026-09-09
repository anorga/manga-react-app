import attackCover from './components/assets/attack.png'
import attackBanner from './components/assets/attackBanner.jpg'
import chainsawCover from './components/assets/chainsaw.jpeg'
import chainsawBanner from './components/assets/chainsawBanner.jpeg'
import jujutsuCover from './components/assets/jjk.jpg'
import jujutsuBanner from './components/assets/jujutsuBanner.jpeg'

export type Manga = {
  slug: string
  title: string
  description: string
  status: string
  genres: string[]
  cover: string
  banner: string
  accent: string
  chapterUrl: (chapter: number) => string
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
    chapterUrl: (chapter) => `https://readaot.com/manga/shingeki-no-kyojin-chapter-${chapter}/`,
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
    chapterUrl: (chapter) => `https://chainsaw-man-mangas.com/manga/chainsaw-man-chapter-${chapter}/`,
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
    chapterUrl: (chapter) => `https://w3.readjujutsu.com/?s=jujutsu+kaisen+chapter+${chapter}`,
  },
]

export const chapters = Array.from({ length: 25 }, (_, index) => index + 1)
