export enum Month {
  January = 1,
  February = 2,
  March = 3,
  April = 4,
  May = 5,
  June = 6,
  July = 7,
  August = 8,
  September = 9,
  October = 10,
  November = 11,
  December = 12,
}

export enum CardType {
  Gwang = 'gwang',     // 광 (5 cards)
  Yeol = 'yeol',       // 열끗 (9 cards)
  Tti = 'tti',         // 띠 (10 cards)
  Pi = 'pi',           // 피 (24 cards)
}

export interface Card {
  id: string;
  month: Month;
  type: CardType;
  imagePath: string;
}

export const CARDS: Card[] = [
  // January (1월) - 송학
  { id: 'january-gwang', month: Month.January, type: CardType.Gwang, imagePath: 'cards/january-gwang.png' },
  { id: 'january-tti', month: Month.January, type: CardType.Tti, imagePath: 'cards/january-tti.png' },
  { id: 'january-pi-1', month: Month.January, type: CardType.Pi, imagePath: 'cards/january-pi-1.png' },
  { id: 'january-pi-2', month: Month.January, type: CardType.Pi, imagePath: 'cards/january-pi-2.png' },

  // February (2월) - 매조
  { id: 'february-yeol', month: Month.February, type: CardType.Yeol, imagePath: 'cards/february-yeol.png' },
  { id: 'february-tti', month: Month.February, type: CardType.Tti, imagePath: 'cards/february-tti.png' },
  { id: 'february-pi-1', month: Month.February, type: CardType.Pi, imagePath: 'cards/february-pi-1.png' },
  { id: 'february-pi-2', month: Month.February, type: CardType.Pi, imagePath: 'cards/february-pi-2.png' },

  // March (3월) - 벚꽃
  { id: 'march-gwang', month: Month.March, type: CardType.Gwang, imagePath: 'cards/march-gwang.png' },
  { id: 'march-tti', month: Month.March, type: CardType.Tti, imagePath: 'cards/march-tti.png' },
  { id: 'march-pi-1', month: Month.March, type: CardType.Pi, imagePath: 'cards/march-pi-1.png' },
  { id: 'march-pi-2', month: Month.March, type: CardType.Pi, imagePath: 'cards/march-pi-2.png' },

  // April (4월) - 등나무
  { id: 'april-yeol', month: Month.April, type: CardType.Yeol, imagePath: 'cards/april-yeol.png' },
  { id: 'april-tti', month: Month.April, type: CardType.Tti, imagePath: 'cards/april-tti.png' },
  { id: 'april-pi-1', month: Month.April, type: CardType.Pi, imagePath: 'cards/april-pi-1.png' },
  { id: 'april-pi-2', month: Month.April, type: CardType.Pi, imagePath: 'cards/april-pi-2.png' },

  // May (5월) - 난초
  { id: 'may-yeol', month: Month.May, type: CardType.Yeol, imagePath: 'cards/may-yeol.png' },
  { id: 'may-tti', month: Month.May, type: CardType.Tti, imagePath: 'cards/may-tti.png' },
  { id: 'may-pi-1', month: Month.May, type: CardType.Pi, imagePath: 'cards/may-pi-1.png' },
  { id: 'may-pi-2', month: Month.May, type: CardType.Pi, imagePath: 'cards/may-pi-2.png' },

  // June (6월) - 목단
  { id: 'june-yeol', month: Month.June, type: CardType.Yeol, imagePath: 'cards/june-yeol.png' },
  { id: 'june-tti', month: Month.June, type: CardType.Tti, imagePath: 'cards/june-tti.png' },
  { id: 'june-pi-1', month: Month.June, type: CardType.Pi, imagePath: 'cards/june-pi-1.png' },
  { id: 'june-pi-2', month: Month.June, type: CardType.Pi, imagePath: 'cards/june-pi-2.png' },

  // July (7월) - 홍싸리
  { id: 'july-yeol', month: Month.July, type: CardType.Yeol, imagePath: 'cards/july-yeol.png' },
  { id: 'july-tti', month: Month.July, type: CardType.Tti, imagePath: 'cards/july-tti.png' },
  { id: 'july-pi-1', month: Month.July, type: CardType.Pi, imagePath: 'cards/july-pi-1.png' },
  { id: 'july-pi-2', month: Month.July, type: CardType.Pi, imagePath: 'cards/july-pi-2.png' },

  // August (8월) - 공산
  { id: 'august-gwang', month: Month.August, type: CardType.Gwang, imagePath: 'cards/august-gwang.png' },
  { id: 'august-yeol', month: Month.August, type: CardType.Yeol, imagePath: 'cards/august-yeol.png' },
  { id: 'august-pi-1', month: Month.August, type: CardType.Pi, imagePath: 'cards/august-pi-1.png' },
  { id: 'august-pi-2', month: Month.August, type: CardType.Pi, imagePath: 'cards/august-pi-2.png' },

  // September (9월) - 국화
  { id: 'september-yeol', month: Month.September, type: CardType.Yeol, imagePath: 'cards/september-yeol.png' },
  { id: 'september-tti', month: Month.September, type: CardType.Tti, imagePath: 'cards/september-tti.png' },
  { id: 'september-pi-1', month: Month.September, type: CardType.Pi, imagePath: 'cards/september-pi-1.png' },
  { id: 'september-pi-2', month: Month.September, type: CardType.Pi, imagePath: 'cards/september-pi-2.png' },

  // October (10월) - 단풍
  { id: 'october-yeol', month: Month.October, type: CardType.Yeol, imagePath: 'cards/october-yeol.png' },
  { id: 'october-pi-1', month: Month.October, type: CardType.Pi, imagePath: 'cards/october-pi-1.png' },
  { id: 'october-pi-2', month: Month.October, type: CardType.Pi, imagePath: 'cards/october-pi-2.png' },
  { id: 'october-pi-3', month: Month.October, type: CardType.Pi, imagePath: 'cards/october-pi-3.png' },

  // November (11월) - 오동
  { id: 'november-gwang', month: Month.November, type: CardType.Gwang, imagePath: 'cards/november-gwang.png' },
  { id: 'november-tti', month: Month.November, type: CardType.Tti, imagePath: 'cards/november-tti.png' },
  { id: 'november-pi', month: Month.November, type: CardType.Pi, imagePath: 'cards/november-pi.png' },
  { id: 'november-pi-double', month: Month.November, type: CardType.Pi, imagePath: 'cards/november-pi-double.png' },

  // December (12월) - 비
  { id: 'december-gwang', month: Month.December, type: CardType.Gwang, imagePath: 'cards/december-gwang.png' },
  { id: 'december-yeol', month: Month.December, type: CardType.Yeol, imagePath: 'cards/december-yeol.png' },
  { id: 'december-tti', month: Month.December, type: CardType.Tti, imagePath: 'cards/december-tti.png' },
  { id: 'december-pi-double', month: Month.December, type: CardType.Pi, imagePath: 'cards/december-pi-double.png' },
];
