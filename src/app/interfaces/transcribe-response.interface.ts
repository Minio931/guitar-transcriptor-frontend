export interface TranscribeResponse {
  bars: BarResponse[][];
  denominator: number;
  numerator: number;
}

export interface BarResponse {
  duration_name: string;
  end_time: number;
  fret: number;
  start_time: number;
  string: number;
}
