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
  Tti = 'tti',         // 띠 (9 cards)
  Pi = 'pi',           // 피 (25 cards)
}

export interface Card {
  id: string;
  month: Month;
  type: CardType;
  imagePath: string;
}

export const CARDS: Card[] = [
  // January (1월)
  { id: 'january-gwang', month: Month.January, type: CardType.Gwang,   imagePath: 'assets/cards/january-gwang.png' },
  { id: 'january-hongdan', month: Month.January, type: CardType.Tti,   imagePath: 'assets/cards/january-hongdan.png' },
  { id: 'january-pi-1', month: Month.January, type: CardType.Pi,   imagePath: 'assets/cards/january-pi-1.png' },
  { id: 'january-pi-2', month: Month.January, type: CardType.Pi,   imagePath: 'assets/cards/january-pi-2.png' },

  // February (2월)
  { id: 'february-hongdan', month: Month.February, type: CardType.Tti,   imagePath: 'assets/cards/february-hongdan.png' },
  { id: 'february-bird', month: Month.February, type: CardType.Yeol,   imagePath: 'assets/cards/february-bird.png' },
  { id: 'february-pi-1', month: Month.February, type: CardType.Pi,   imagePath: 'assets/cards/february-pi-1.png' },
  { id: 'february-pi-2', month: Month.February, type: CardType.Pi,   imagePath: 'assets/cards/february-pi-2.png' },

  // March (3월)
  { id: 'march-gwang', month: Month.March, type: CardType.Gwang,   imagePath: 'assets/cards/march-gwang.png' },
  { id: 'march-hongdan', month: Month.March, type: CardType.Tti,   imagePath: 'assets/cards/march-hongdan.png' },
  { id: 'march-pi-1', month: Month.March, type: CardType.Pi,   imagePath: 'assets/cards/march-pi-1.png' },
  { id: 'march-pi-2', month: Month.March, type: CardType.Pi,   imagePath: 'assets/cards/march-pi-2.png' },

  // April (4월)
  { id: 'april-hongdan', month: Month.April, type: CardType.Tti,   imagePath: 'assets/cards/april-hongdan.png' },
  { id: 'april-bird', month: Month.April, type: CardType.Yeol,   imagePath: 'assets/cards/april-bird.png' },
  { id: 'april-pi-1', month: Month.April, type: CardType.Pi,   imagePath: 'assets/cards/april-pi-1.png' },
  { id: 'april-pi-2', month: Month.April, type: CardType.Pi,   imagePath: 'assets/cards/april-pi-2.png' },

  // May (5월)
  { id: 'may-hongdan', month: Month.May, type: CardType.Tti,   imagePath: 'assets/cards/may-hongdan.png' },
  { id: 'may-bird', month: Month.May, type: CardType.Yeol,   imagePath: 'assets/cards/may-bird.png' },
  { id: 'may-pi-1', month: Month.May, type: CardType.Pi,   imagePath: 'assets/cards/may-pi-1.png' },
  { id: 'may-pi-2', month: Month.May, type: CardType.Pi,   imagePath: 'assets/cards/may-pi-2.png' },

  // June (6월)
  { id: 'june-cheongdan', month: Month.June, type: CardType.Tti,   imagePath: 'assets/cards/june-cheongdan.png' },
  { id: 'june-bird', month: Month.June, type: CardType.Yeol,   imagePath: 'assets/cards/june-bird.png' },
  { id: 'june-pi-1', month: Month.June, type: CardType.Pi,   imagePath: 'assets/cards/june-pi-1.png' },
  { id: 'june-pi-2', month: Month.June, type: CardType.Pi,   imagePath: 'assets/cards/june-pi-2.png' },

  // July (7월)
  { id: 'july-chodan', month: Month.July, type: CardType.Tti,   imagePath: 'assets/cards/july-chodan.png' },
  { id: 'july-bird', month: Month.July, type: CardType.Yeol,   imagePath: 'assets/cards/july-bird.png' },
  { id: 'july-pi-1', month: Month.July, type: CardType.Pi,   imagePath: 'assets/cards/july-pi-1.png' },
  { id: 'july-pi-2', month: Month.July, type: CardType.Pi,   imagePath: 'assets/cards/july-pi-2.png' },

  // August (8월)
  { id: 'august-gwang', month: Month.August, type: CardType.Gwang,   imagePath: 'assets/cards/august-gwang.png' },
  { id: 'august-animal', month: Month.August, type: CardType.Yeol,   imagePath: 'assets/cards/august-animal.png' },
  { id: 'august-pi-1', month: Month.August, type: CardType.Pi,   imagePath: 'assets/cards/august-pi-1.png' },
  { id: 'august-pi-2', month: Month.August, type: CardType.Pi,   imagePath: 'assets/cards/august-pi-2.png' },

  // September (9월)
  { id: 'september-chodan', month: Month.September, type: CardType.Tti,   imagePath: 'assets/cards/september-chodan.png' },
  { id: 'september-animal', month: Month.September, type: CardType.Yeol,   imagePath: 'assets/cards/september-animal.png' },
  { id: 'september-pi-1', month: Month.September, type: CardType.Pi,   imagePath: 'assets/cards/september-pi-1.png' },
  { id: 'september-pi-2', month: Month.September, type: CardType.Pi,   imagePath: 'assets/cards/september-pi-2.png' },

  // October (10월)
  { id: 'october-chodan', month: Month.October, type: CardType.Tti,   imagePath: 'assets/cards/october-chodan.png' },
  { id: 'october-bird', month: Month.October, type: CardType.Yeol,   imagePath: 'assets/cards/october-bird.png' },
  { id: 'october-pi-1', month: Month.October, type: CardType.Pi,   imagePath: 'assets/cards/october-pi-1.png' },
  { id: 'october-pi-2', month: Month.October, type: CardType.Pi,   imagePath: 'assets/cards/october-pi-2.png' },

  // November (11월)
  { id: 'november-gwang', month: Month.November, type: CardType.Gwang,   imagePath: 'assets/cards/november-gwang.png' },
  { id: 'november-pi-1', month: Month.November, type: CardType.Pi,   imagePath: 'assets/cards/november-pi-1.png' },
  { id: 'november-pi-2', month: Month.November, type: CardType.Pi,   imagePath: 'assets/cards/november-pi-2.png' },
  { id: 'november-pi-3', month: Month.November, type: CardType.Pi,   imagePath: 'assets/cards/november-pi-3.png' },

  // December (12월)
  { id: 'december-gwang', month: Month.December, type: CardType.Gwang,   imagePath: 'assets/cards/december-gwang.png' },
  { id: 'december-animal', month: Month.December, type: CardType.Yeol,   imagePath: 'assets/cards/december-animal.png' },
  { id: 'december-pi-1', month: Month.December, type: CardType.Pi,   imagePath: 'assets/cards/december-pi-1.png' },
  { id: 'december-pi-2', month: Month.December, type: CardType.Pi,   imagePath: 'assets/cards/december-pi-2.png' },
];
