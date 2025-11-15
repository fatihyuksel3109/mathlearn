export interface BadgeDefinition {
  id: string;
  emoji: string;
  name: string;
  description: string;
}

export const BADGE_DEFINITIONS: Record<string, BadgeDefinition> = {
  ballon_ustasi: {
    id: 'ballon_ustasi',
    emoji: '🎈',
    name: 'Balon Ustası',
    description: '10 balonu doğru patlat',
  },
  hizli_refleks: {
    id: 'hizli_refleks',
    emoji: '⚡',
    name: 'Hızlı Refleks',
    description: '3 soruyu 10 saniye içinde doğru çöz',
  },
  mukemmel_seri: {
    id: 'mukemmel_seri',
    emoji: '💎',
    name: 'Mükemmel Seri',
    description: '10 soruyu üst üste hatasız çöz',
  },
  toplama_kahramani: {
    id: 'toplama_kahramani',
    emoji: '🧮',
    name: 'Toplama Kahramanı',
    description: '50 toplama sorusunda başarı',
  },
  carpma_ustasi: {
    id: 'carpma_ustasi',
    emoji: '🔢',
    name: 'Çarpma Ustası',
    description: '30 çarpma sorusunu doğru çöz',
  },
  gunun_sampiyonu: {
    id: 'gunun_sampiyonu',
    emoji: '🌟',
    name: 'Günün Şampiyonu',
    description: 'Gün içinde 300 XP kazan',
  },
  balon_efsanesi: {
    id: 'balon_efsanesi',
    emoji: '🕹️',
    name: 'Balon Efsanesi',
    description: '100 toplam doğru cevap',
  },
};

