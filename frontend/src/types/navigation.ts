export type Screen = 'GALLERY' | 'ARCHIVE' | 'TIMELINE' | 'RESTORATION' | 'INQUIRY' | 'SETTINGS';
export type TransitionType = 'push' | 'push_back' | 'slide_up';

export type NavigateFn = (screen: Screen, type: TransitionType) => void;
