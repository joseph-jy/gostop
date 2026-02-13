export interface RuleSet {
  name: string;
  goStopThreshold: number;
  piBakMaxPiCount: number;
  goBakMinGoCount: number;
  goMultiplierFromCount: number;
  enableMeongteongguri: boolean;
  dokbakStealThreshold: number;
}

export const STANDARD_RULESET: RuleSet = {
  name: 'standard-matgo',
  goStopThreshold: 7,
  piBakMaxPiCount: 5,
  goBakMinGoCount: 3,
  goMultiplierFromCount: 3,
  enableMeongteongguri: true,
  dokbakStealThreshold: 3,
};
