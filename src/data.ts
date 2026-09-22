import attackCover from './components/assets/attack-cover.jpg'
import attackBanner from './components/assets/attack-banner.jpg'
import chainsawCover from './components/assets/chainsaw-cover.jpg'
import chainsawBanner from './components/assets/chainsaw-banner.jpg'
import jujutsuCover from './components/assets/jujutsu-cover.jpg'
import jujutsuBanner from './components/assets/jujutsu-banner.jpg'
import onePieceCover from './components/assets/onepiece-cover.jpg'
import onePieceBanner from './components/assets/onepiece-banner.jpg'
import demonSlayerCover from './components/assets/demonslayer-cover.jpg'
import demonSlayerBanner from './components/assets/demonslayer-banner.jpg'
import myHeroCover from './components/assets/myhero-cover.jpg'
import myHeroBanner from './components/assets/myhero-banner.jpg'
import onePunchCover from './components/assets/onepunch-cover.jpg'
import onePunchBanner from './components/assets/onepunch-banner.jpg'
import narutoCover from './components/assets/naruto-cover.jpg'
import narutoBanner from './components/assets/naruto-banner.jpg'
import dragonBallCover from './components/assets/dragonball-cover.jpg'
import dragonBallBanner from './components/assets/dragonball-banner.jpg'
import vinlandCover from './components/assets/vinland-cover.jpg'
import vinlandBanner from './components/assets/vinland-banner.jpg'
import spyFamilyCover from './components/assets/spyfamily-cover.jpg'
import spyFamilyBanner from './components/assets/spyfamily-banner.jpg'
import drStoneCover from './components/assets/drstone-cover.jpg'
import drStoneBanner from './components/assets/drstone-banner.jpg'

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

const VIZ = 'https://www.viz.com/manga-books'

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
  {
    slug: 'onepiece',
    title: 'One Piece',
    description: 'Inspired by the pirate legends of his childhood, Monkey D. Luffy sets sail to find the One Piece and claim the title of King of the Pirates.',
    status: 'Ongoing',
    genres: ['Adventure', 'Action'],
    cover: onePieceCover,
    banner: onePieceBanner,
    accent: '#3f9d8f',
    author: 'Eiichiro Oda',
    publisher: 'VIZ Media',
    officialUrl: 'https://www.viz.com/shonenjump/chapters/one-piece',
    year: 1997,
    chapters: 1106,
    rating: 4.8,
  },
  {
    slug: 'demonslayer',
    title: 'Demon Slayer',
    description: 'After his family is slaughtered, Tanjiro joins the Demon Slayer Corps to avenge his sister and cure her of her transformation.',
    status: 'Completed',
    genres: ['Action', 'Supernatural'],
    cover: demonSlayerCover,
    banner: demonSlayerBanner,
    accent: '#5fae6f',
    author: 'Koyoharu Gotouge',
    publisher: 'VIZ Media',
    officialUrl: VIZ,
    year: 2016,
    endYear: 2020,
    chapters: 207,
    rating: 4.0,
  },
  {
    slug: 'myhero',
    title: 'My Hero Academia',
    description: 'In a world where nearly everyone has a superpower, Izuku Midoriya inherits the Quirk of his hero idol and enters an elite academy.',
    status: 'Completed',
    genres: ['Action', 'Adventure'],
    cover: myHeroCover,
    banner: myHeroBanner,
    accent: '#5f8fd6',
    author: 'Kohei Horikoshi',
    publisher: 'VIZ Media',
    officialUrl: 'https://www.viz.com/shonenjump/chapters/my-hero-academia',
    year: 2014,
    endYear: 2024,
    chapters: 432,
    rating: 3.9,
  },
  {
    slug: 'onepunch',
    title: 'One Punch Man',
    description: 'Bored by a life of perfect victory, hero Saitama can defeat any foe with a single punch—yet struggles to find a challenge worth having.',
    status: 'Ongoing',
    genres: ['Action', 'Comedy'],
    cover: onePunchCover,
    banner: onePunchBanner,
    accent: '#d6a24a',
    author: 'ONE / Yusuke Murata',
    publisher: 'VIZ Media',
    officialUrl: 'https://www.viz.com/shonenjump/chapters/one-punch-man',
    year: 2012,
    chapters: 230,
    rating: 4.2,
  },
  {
    slug: 'naruto',
    title: 'Naruto',
    description: 'Rejected by his village, orphan ninja Naruto Uzumaki dreams of earning the respect of the Hokage to prove his worth as a protector.',
    status: 'Completed',
    genres: ['Action', 'Adventure'],
    cover: narutoCover,
    banner: narutoBanner,
    accent: '#d67f3f',
    author: 'Masashi Kishimoto',
    publisher: 'VIZ Media',
    officialUrl: 'https://www.viz.com/shonenjump/chapters/naruto',
    year: 1999,
    endYear: 2014,
    chapters: 700,
    rating: 4.3,
  },
  {
    slug: 'dragonball',
    title: 'Dragon Ball',
    description: 'Searching for the legendary Dragon Balls, young warrior Son Goku is pulled into a world of martial arts masters, gods, and galactic threats.',
    status: 'Completed',
    genres: ['Action', 'Adventure', 'Supernatural'],
    cover: dragonBallCover,
    banner: dragonBallBanner,
    accent: '#d6b23f',
    author: 'Akira Toriyama',
    publisher: 'VIZ Media',
    officialUrl: 'https://www.viz.com/shonenjump/chapters/dragon-ball',
    year: 1984,
    endYear: 1995,
    chapters: 520,
    rating: 4.5,
  },
  {
    slug: 'vinland',
    title: 'Vinland Saga',
    description: 'Raised as a warrior, young Thorfinn seeks revenge for his father’s death until a voyage to a distant land forces him to rethink what peace means.',
    status: 'Completed',
    genres: ['Action', 'Adventure', 'Drama'],
    cover: vinlandCover,
    banner: vinlandBanner,
    accent: '#6f86a0',
    author: 'Makoto Yukimura',
    publisher: 'VIZ Media',
    officialUrl: VIZ,
    year: 2005,
    endYear: 2025,
    chapters: 224,
    rating: 4.5,
  },
  {
    slug: 'spyfamily',
    title: 'Spy x Family',
    description: 'An elite spy assembles a fake family for a covert mission—without telling his new wife or daughter that they don’t actually know each other.',
    status: 'Ongoing',
    genres: ['Action', 'Comedy', 'Slice of Life'],
    cover: spyFamilyCover,
    banner: spyFamilyBanner,
    accent: '#d66f8f',
    author: 'Tatsuya Endo',
    publisher: 'VIZ Media',
    officialUrl: 'https://www.viz.com/shonenjump/chapters/spy-x-family',
    year: 2019,
    chapters: 188,
    rating: 4.2,
  },
  {
    slug: 'drstone',
    title: 'Dr. Stone',
    description: 'When all of humanity turns to stone, genius scientist-genius Ishigami works to rebuild civilization from scratch using science and sheer will.',
    status: 'Completed',
    genres: ['Adventure', 'Sci-Fi'],
    cover: drStoneCover,
    banner: drStoneBanner,
    accent: '#4fb3a8',
    author: 'Riichiro Imagawa / Boichi',
    publisher: 'VIZ Media',
    officialUrl: 'https://www.viz.com/shonenjump/chapters/dr-stone',
    year: 2017,
    endYear: 2024,
    chapters: 236,
    rating: 4.1,
  },
]

export function getMangaBySlug(slug: string | undefined) {
  return manga.find((item) => item.slug === slug)
}

export const allGenres = [...new Set(manga.flatMap((item) => item.genres))].sort()
