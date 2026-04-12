export type Screen =
  | 'GALLERY'
  | 'ARCHIVE'
  | 'RESTORATION'
  | 'INQUIRY'
  | 'SETTINGS'
  | 'CONTACT_AGENTS';

export type TransitionType = 'push' | 'push_back' | 'slide_up';

export type NavigateFn = (screen: Screen, type: TransitionType) => void;

/** Passed from risk dashboard → contact agents flow */
export type CoverageKind = 'auto' | 'home' | 'life';

export type ContactAgentSummary = {
  riskScore: number;
  topRiskFactor: string;
  coverageType: CoverageKind;
};
