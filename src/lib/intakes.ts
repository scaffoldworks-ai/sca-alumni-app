export type Intake = { name: string; years: string };

export const INTAKES: Intake[] = [
  { name: 'Busk', years: '2010–11' },
  { name: 'Love Child', years: 'Early 2011' },
  { name: 'Spank', years: '2011–12' },
  { name: 'Love Thy Labour', years: '2012–13' },
  { name: 'Bark', years: '2013–14' },
  { name: 'Mosh', years: '2014–15' },
  { name: 'Coup', years: '2015–16' },
  { name: 'Fat Penguin', years: '2016–17' },
  { name: 'John', years: '2017–18' },
  { name: 'Hush', years: '2018–19' },
  { name: 'Krak', years: '2019–20' },
  { name: 'Checkout', years: '2020–21' },
  { name: 'Stick It', years: '2021–22' },
  { name: 'Boat', years: '2021–22' },
  { name: 'Honey', years: '2022–23' },
  { name: 'Cymbals', years: '2023–24' },
  { name: 'The Mob', years: '2024–25' },
  { name: 'Dominatrix', years: '2025–26' },
];

export function intakeYears(name: string | undefined): string {
  return INTAKES.find((i) => i.name === name)?.years ?? '';
}
