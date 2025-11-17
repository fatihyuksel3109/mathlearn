export interface BadgeDefinition {
  id: string;
  emoji: string;
  name: string;
  description: string;
}

export const BADGE_DEFINITIONS: Record<string, BadgeDefinition> = {
  // === EXISTING BADGES ===
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

  // === SPEED BADGES ===
  simsek_refleks: {
    id: 'simsek_refleks',
    emoji: '⚡',
    name: 'Şimşek Refleks',
    description: '3 soruyu 5 saniye içinde doğru çöz',
  },
  hiz_canavari: {
    id: 'hiz_canavari',
    emoji: '🚀',
    name: 'Hız Canavarı',
    description: '5 soruyu 15 saniye içinde doğru çöz',
  },
  zaman_ustasi: {
    id: 'zaman_ustasi',
    emoji: '⏱️',
    name: 'Zaman Ustası',
    description: '10 soruyu 30 saniye içinde doğru çöz',
  },
  ultra_hizli: {
    id: 'ultra_hizli',
    emoji: '💨',
    name: 'Ultra Hızlı',
    description: '20 soruyu 60 saniye içinde doğru çöz',
  },
  flas_sampiyonu: {
    id: 'flas_sampiyonu',
    emoji: '✨',
    name: 'Flaş Şampiyonu',
    description: '50 soruyu 2 dakika içinde doğru çöz',
  },

  // === ACCURACY BADGES ===
  mukemmel_baslangic: {
    id: 'mukemmel_baslangic',
    emoji: '⭐',
    name: 'Mükemmel Başlangıç',
    description: '5 soruyu üst üste hatasız çöz',
  },
  dogruluk_kahramani: {
    id: 'dogruluk_kahramani',
    emoji: '🎯',
    name: 'Doğruluk Kahramanı',
    description: '20 soruyu üst üste hatasız çöz',
  },
  mukemmel_usta: {
    id: 'mukemmel_usta',
    emoji: '🏆',
    name: 'Mükemmel Usta',
    description: '50 soruyu üst üste hatasız çöz',
  },
  sifir_hata: {
    id: 'sifir_hata',
    emoji: '💯',
    name: 'Sıfır Hata',
    description: '20 soruda %100 doğruluk oranı',
  },
  kusursuz: {
    id: 'kusursuz',
    emoji: '👑',
    name: 'Kusursuz',
    description: '50 soruda %100 doğruluk oranı',
  },

  // === OPERATION-SPECIFIC BADGES (TOPLAMA) ===
  toplama_yeni_baslayan: {
    id: 'toplama_yeni_baslayan',
    emoji: '➕',
    name: 'Toplama Yeni Başlayan',
    description: '50 toplama sorusunu doğru çöz',
  },
  toplama_uzmani: {
    id: 'toplama_uzmani',
    emoji: '🧮',
    name: 'Toplama Uzmanı',
    description: '100 toplama sorusunu doğru çöz',
  },
  toplama_efsanesi: {
    id: 'toplama_efsanesi',
    emoji: '⭐',
    name: 'Toplama Efsanesi',
    description: '500 toplama sorusunu doğru çöz',
  },

  // === OPERATION-SPECIFIC BADGES (ÇIKARMA) ===
  cikarma_yeni_baslayan: {
    id: 'cikarma_yeni_baslayan',
    emoji: '➖',
    name: 'Çıkarma Yeni Başlayan',
    description: '50 çıkarma sorusunu doğru çöz',
  },
  cikarma_uzmani: {
    id: 'cikarma_uzmani',
    emoji: '📊',
    name: 'Çıkarma Uzmanı',
    description: '100 çıkarma sorusunu doğru çöz',
  },
  cikarma_efsanesi: {
    id: 'cikarma_efsanesi',
    emoji: '🌟',
    name: 'Çıkarma Efsanesi',
    description: '500 çıkarma sorusunu doğru çöz',
  },

  // === OPERATION-SPECIFIC BADGES (ÇARPMA) ===
  carpma_yeni_baslayan: {
    id: 'carpma_yeni_baslayan',
    emoji: '✖️',
    name: 'Çarpma Yeni Başlayan',
    description: '30 çarpma sorusunu doğru çöz',
  },
  carpma_uzmani: {
    id: 'carpma_uzmani',
    emoji: '🔢',
    name: 'Çarpma Uzmanı',
    description: '100 çarpma sorusunu doğru çöz',
  },
  carpma_efsanesi: {
    id: 'carpma_efsanesi',
    emoji: '💫',
    name: 'Çarpma Efsanesi',
    description: '300 çarpma sorusunu doğru çöz',
  },

  // === OPERATION-SPECIFIC BADGES (BÖLME) ===
  bolme_yeni_baslayan: {
    id: 'bolme_yeni_baslayan',
    emoji: '➗',
    name: 'Bölme Yeni Başlayan',
    description: '25 bölme sorusunu doğru çöz',
  },
  bolme_uzmani: {
    id: 'bolme_uzmani',
    emoji: '📐',
    name: 'Bölme Uzmanı',
    description: '75 bölme sorusunu doğru çöz',
  },
  bolme_efsanesi: {
    id: 'bolme_efsanesi',
    emoji: '🔮',
    name: 'Bölme Efsanesi',
    description: '200 bölme sorusunu doğru çöz',
  },

  // === LEVEL PROGRESSION BADGES ===
  macera_baslangic: {
    id: 'macera_baslangic',
    emoji: '🗺️',
    name: 'Macera Başlangıcı',
    description: '1 macera seviyesini tamamla',
  },
  macera_kesifci: {
    id: 'macera_kesifci',
    emoji: '🏔️',
    name: 'Macera Keşifçi',
    description: '3 macera seviyesini tamamla',
  },
  macera_efsanesi: {
    id: 'macera_efsanesi',
    emoji: '🏰',
    name: 'Macera Efsanesi',
    description: '6 macera seviyesini tamamla',
  },
  macera_ustasi: {
    id: 'macera_ustasi',
    emoji: '💎',
    name: 'Macera Ustası',
    description: 'Tüm seviyelerde mükemmel performans',
  },
  seviye_hiz_rekortmeni: {
    id: 'seviye_hiz_rekortmeni',
    emoji: '🏃',
    name: 'Seviye Hız Rekortmeni',
    description: 'Bir seviyeyi rekor hızla tamamla',
  },
  butun_seviyeleri_ac: {
    id: 'butun_seviyeleri_ac',
    emoji: '🗝️',
    name: 'Bütün Seviyeleri Aç',
    description: 'Tüm macera seviyelerinin kilidini aç',
  },

  // === STREAK BADGES ===
  uc_gunluk_seri: {
    id: 'uc_gunluk_seri',
    emoji: '🔥',
    name: '3 Günlük Seri',
    description: '3 gün üst üste oyna',
  },
  haftalik_kahraman: {
    id: 'haftalik_kahraman',
    emoji: '📅',
    name: 'Haftalık Kahraman',
    description: '7 gün üst üste oyna',
  },
  iki_hafta_ustasi: {
    id: 'iki_hafta_ustasi',
    emoji: '💪',
    name: 'İki Hafta Ustası',
    description: '14 gün üst üste oyna',
  },
  ayin_sampiyonu: {
    id: 'ayin_sampiyonu',
    emoji: '🌙',
    name: 'Ayın Şampiyonu',
    description: '30 gün üst üste oyna',
  },
  yuz_gun_efsanesi: {
    id: 'yuz_gun_efsanesi',
    emoji: '💯',
    name: '100 Gün Efsanesi',
    description: '100 gün üst üste oyna',
  },

  // === GAME-SPECIFIC BADGES (BALLOON POP) ===
  balon_yeni_baslayan: {
    id: 'balon_yeni_baslayan',
    emoji: '🎈',
    name: 'Balon Yeni Başlayan',
    description: 'Balon Patlat oyununda 5 doğru',
  },
  balon_uzmani: {
    id: 'balon_uzmani',
    emoji: '🎊',
    name: 'Balon Uzmanı',
    description: 'Balon Patlat oyununda 50 doğru',
  },
  balon_efsanesi_oyun: {
    id: 'balon_efsanesi_oyun',
    emoji: '🎆',
    name: 'Balon Efsanesi',
    description: 'Balon Patlat oyununda 200 doğru',
  },

  // === GAME-SPECIFIC BADGES (QUICK RACE) ===
  hizli_yaris_yeni_baslayan: {
    id: 'hizli_yaris_yeni_baslayan',
    emoji: '🏁',
    name: 'Hızlı Yarış Yeni Başlayan',
    description: 'Hızlı Yarış oyununda 10 doğru',
  },
  hizli_yaris_uzmani: {
    id: 'hizli_yaris_uzmani',
    emoji: '🏎️',
    name: 'Hızlı Yarış Uzmanı',
    description: 'Hızlı Yarış oyununda 100 doğru',
  },
  hizli_yaris_sampiyonu: {
    id: 'hizli_yaris_sampiyonu',
    emoji: '🏆',
    name: 'Hızlı Yarış Şampiyonu',
    description: 'Hızlı Yarış oyununda 500 doğru',
  },

  // === GAME-SPECIFIC BADGES (FRACTIONS) ===
  kesir_ustasi: {
    id: 'kesir_ustasi',
    emoji: '🧩',
    name: 'Kesir Ustası',
    description: 'Kesirler oyununda 20 başarı',
  },
  kesir_buyucusu: {
    id: 'kesir_buyucusu',
    emoji: '🪄',
    name: 'Kesir Büyücüsü',
    description: 'Kesirler oyununda 100 başarı',
  },

  // === GAME-SPECIFIC BADGES (GEOMETRY) ===
  geometri_uzmani: {
    id: 'geometri_uzmani',
    emoji: '🔷',
    name: 'Geometri Uzmanı',
    description: 'Geometri oyununda 20 başarı',
  },
  geometri_dahisi: {
    id: 'geometri_dahisi',
    emoji: '✨',
    name: 'Geometri Dahisi',
    description: 'Geometri oyununda 100 başarı',
  },

  // === XP MILESTONE BADGES ===
  ilk_adimlar: {
    id: 'ilk_adimlar',
    emoji: '👶',
    name: 'İlk Adımlar',
    description: '100 XP kazan',
  },
  ogrenci_yildiz: {
    id: 'ogrenci_yildiz',
    emoji: '⭐',
    name: 'Öğrenci Yıldız',
    description: '500 XP kazan',
  },
  ogrenci_kahramani: {
    id: 'ogrenci_kahramani',
    emoji: '🌟',
    name: 'Öğrenci Kahramanı',
    description: '1000 XP kazan',
  },
  matematik_ustasi: {
    id: 'matematik_ustasi',
    emoji: '🎓',
    name: 'Matematik Ustası',
    description: '2500 XP kazan',
  },
  matematik_efsanesi: {
    id: 'matematik_efsanesi',
    emoji: '👑',
    name: 'Matematik Efsanesi',
    description: '5000 XP kazan',
  },
  ustun_ogrenci: {
    id: 'ustun_ogrenci',
    emoji: '💫',
    name: 'Üstün Öğrenci',
    description: '10000 XP kazan',
  },
  matematik_dehasi: {
    id: 'matematik_dehasi',
    emoji: '🧠',
    name: 'Matematik Dehası',
    description: '25000 XP kazan',
  },

  // === WEEKLY/DAILY CHALLENGE BADGES ===
  hafta_savasci: {
    id: 'hafta_savasci',
    emoji: '🗡️',
    name: 'Hafta Savaşçı',
    description: 'Bir haftada 5 gün oyna',
  },
  gunluk_sampiyon: {
    id: 'gunluk_sampiyon',
    emoji: '🥇',
    name: 'Günlük Şampiyon',
    description: 'Bir günde 500 XP kazan',
  },
  haftalik_usta: {
    id: 'haftalik_usta',
    emoji: '📊',
    name: 'Haftalık Usta',
    description: 'Bir haftada 2000 XP kazan',
  },
  hafta_sonu_savasci: {
    id: 'hafta_sonu_savasci',
    emoji: '🎮',
    name: 'Hafta Sonu Savaşçı',
    description: 'Cumartesi ve Pazar günleri oyna',
  },

  // === RARE/SECRET BADGES ===
  gece_yarisi_oyuncu: {
    id: 'gece_yarisi_oyuncu',
    emoji: '🦉',
    name: 'Gece Yarısı Oyuncu',
    description: 'Gece yarısından sonra oyna',
  },
  erken_kusu: {
    id: 'erken_kusu',
    emoji: '🐦',
    name: 'Erken Kuşu',
    description: 'Sabah 6\'dan önce oyna',
  },
  mukemmel_hafta: {
    id: 'mukemmel_hafta',
    emoji: '🌈',
    name: 'Mükemmel Hafta',
    description: '7 gün üst üste hatasız oyun',
  },
  koleksiyoncu: {
    id: 'koleksiyoncu',
    emoji: '🏅',
    name: 'Koleksiyoncu',
    description: '25 farklı rozet kazan',
  },
};

