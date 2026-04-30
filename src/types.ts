/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MusicSample {
  id: string;
  audio_path: string;
  filename: string;
  caption: string;
  genre: string;
  lyrics: string;
  raw_lyrics: string;
  formatted_lyrics: string;
  bpm: number;
  keyscale: string;
  timesignature: string;
  duration: number;
  language: string;
  is_instrumental: boolean;
  custom_tag: string;
  labeled: boolean;
  prompt_override: string | null;
}

export interface DatasetMetadata {
  name: string;
  custom_tag: string;
  tag_position: string;
  created_at: string;
  num_samples: number;
  all_instrumental: boolean;
  genre_ratio: number;
}

export interface DatasetJson {
  metadata: DatasetMetadata;
  samples: MusicSample[];
}
