export enum VoiceName {
  Kore = 'Kore',
  Puck = 'Puck',
  Charon = 'Charon',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
}

export interface VoiceOption {
  id: VoiceName;
  label: string;
  description: string;
  gender: 'Male' | 'Female';
}

export const VOICE_OPTIONS: VoiceOption[] = [
  { id: VoiceName.Kore, label: 'Kore', description: 'Calm & Soothing', gender: 'Female' },
  { id: VoiceName.Puck, label: 'Puck', description: 'Energetic & Clear', gender: 'Male' },
  { id: VoiceName.Charon, label: 'Charon', description: 'Deep & Authoritative', gender: 'Male' },
  { id: VoiceName.Fenrir, label: 'Fenrir', description: 'Strong & Resonant', gender: 'Male' },
  { id: VoiceName.Zephyr, label: 'Zephyr', description: 'Gentle & Airy', gender: 'Female' },
];
