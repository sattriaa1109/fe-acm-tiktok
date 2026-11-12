// Data ini disamakan dengan konfigurasi di backend:
// - ACCOUNT_PORT_MAP & DISPLAY_NAMES (tiktok_comment.py)
// - list_moods() (gemini_comment.py)

export const ACCOUNTS = [
  { id: 'akun1', name: 'Fatur Ikhsanudin', port: 9222, initials: 'FI', tone: 'pink' },
  { id: 'akun2', name: 'Ridetes7', port: 9223, initials: 'R7', tone: 'cyan' },
  { id: 'akun3', name: 'Ridonajrul', port: 9224, initials: 'RN', tone: 'violet' },
  { id: 'akun4', name: 'Usertestpkl', port: 9225, initials: 'UT', tone: 'amber' },
  { id: 'akun5', name: 'Gptridho', port: 9226, initials: 'GP', tone: 'lime' },
]

export const MOODS = [
  {
    id: 'positive',
    label: 'Positif',
    emoji: '😊',
    description: 'Pujian & dukungan',
    example: 'Kontennya keren banget, lanjut terus! 🔥',
  },
  {
    id: 'negative',
    label: 'Negatif',
    emoji: '😒',
    description: 'Kritik & sinis',
    example: 'Hmm, menurutku masih banyak yang bisa diperbaiki.',
  },
]

export const ACCOUNT_IDS = ACCOUNTS.map((account) => account.id)

export function getAccount(id) {
  return ACCOUNTS.find((account) => account.id === id)
}

export function getMood(id) {
  return MOODS.find((mood) => mood.id === id)
}
