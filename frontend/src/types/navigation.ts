export type Screen = 'GALLERY' | 'ARCHIVE' | 'RESTORATION' | 'INQUIRY';
export type TransitionType = 'push' | 'push_back' | 'slide_up';

export type NavigateFn = (screen: Screen, type: TransitionType) => void;
