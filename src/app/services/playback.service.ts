import {TabulatureService} from "./tabulature.service";
import {inject, Injectable} from "@angular/core";
import * as Tone from "tone";
import {BarItem} from "../types/bar-item.type";
import {DeepCopy} from "../functions/deep-copy.function";
import {TabObjectType} from "../enums/tab-object-type.enum";
import {TimeSignature} from "../types/time-signature.type";
import {NoteEnum} from "../enums/note.enum";
import GuitarNotesConfig from "../configs/guitar-notes.config";
import {HighlightService} from "./highlight.service";
import {PlayNotes} from "../types/play-notes.type";
import {ArrowKeyEnum} from "../enums/arrow-key.enum";

const TEMPO = 20;

@Injectable({providedIn: 'root'})
export class PlaybackService {
  tabulatureService: TabulatureService = inject(TabulatureService);
  highlightService: HighlightService = inject(HighlightService);
  synth: Tone.Sampler | null = null;
  timeouts: number[] = [];

  constructor() {
    this.initializeSynth();
  }

  playTabulature() {
    if (!this.synth || this.synth.disposed) {
      this.initializeSynth();
    }

    const bars = this.getNotes();
    let time = Tone.now();
    let delay = 0;
    this.initializeHighlight(bars[0]);

    bars.forEach(bar => {
      bar.notes.forEach(column => {
        let duration = 0;
        column.forEach((note, index) => {
          if (note.tabObject?.fretNumber === undefined) return;

          const playableNote = this.getPlayableNote(note!.tabObject!.fretNumber!, index + 1);
          duration = this.calculatePlayDuration(note!.note!.type, bar.timeSignature);
          this.playNoteWithHighlight(playableNote, duration, delay);
          delay += duration * 1000;
        })
        time += duration;
      })
    })
  }

  playNoteWithHighlight(note: number, duration: number, delay: number) {
    const timeoutId = setTimeout(() => {
      this.playNote(note, duration, Tone.now());
      this.moveHighlight();
    }, delay);

    // @ts-ignore
    this.timeouts.push(timeoutId);
  }

  initializeHighlight(item: PlayNotes) {
    const {notes, timeSignature, rowIndex, barIndex} = item;
    const firstItemPosition = {
      x: notes[1][0].x,
      y: notes[1][0].y,
      rowNumber: rowIndex,
      columnNumber: 0,
      stringNumber: 1,
      barNumber: barIndex
    };

    this.highlightService.setHighlightPosition(firstItemPosition);
  }

  moveHighlight() {
    if (this.highlightService.highlight) {
      this.highlightService.setHighlightPosition(
        this.highlightService.moveHighlight(
          ArrowKeyEnum.ArrowRight,
          this.tabulatureService.tabulation(),
          this.highlightService.highlight
        )
      );
    }
  }

  stopPlayback() {
    if (this.synth) {
      this.synth.dispose();
      this.synth = null;
      this.clearAllTimeouts();
      this.initializeSynth();
    }
  }

  private clearAllTimeouts() {
    while (this.timeouts.length) {
      const timeoutId = this.timeouts.pop();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  private initializeSynth() {
    this.synth = this.loadSampler('assets/samples', 'mp3').toDestination();
  }

  private playNote(note: number, duration: number, time: number) {
    this.synth?.triggerAttackRelease(Tone.Frequency(note, "midi").toNote(), duration, time);
  }

  private getNotes(): PlayNotes[] {
    const tabulation = DeepCopy(this.tabulatureService.tabulation());
    return tabulation.flatMap((row, rowIndex) =>
      row.bars.flatMap((bar, barIndex) => {
        return {
          notes: bar.items.map(item => item.filter((item) => item.tabObject?.type === TabObjectType.Note)),
          timeSignature: bar.timeSignature,
          rowIndex,
          barIndex
        }
      }
      ));
  }

  private getPlayableNote(fretNumber: number, stringNumber: number): number {
    const tuning: string[] = this.tabulatureService.activeGuitarTuning();
    return Tone.Frequency(tuning[stringNumber - 1]).toMidi() + fretNumber;
  }

  private calculatePlayDuration(note: NoteEnum, timeSignature: TimeSignature): number {
    const timeOfBeat = 60 / TEMPO;
    const noteValue = 1 / Number(note);
    return timeOfBeat * (timeSignature.numerator / timeSignature.denominator) * noteValue;
  }

  private loadSampler(url: string, extension: string): Tone.Sampler {
    const notes = this.loadNotes(url, extension);

    return new Tone.Sampler({
      ...notes
    });
  }

  private loadNotes(url: string, extension: string): Record<string, string> {
    return Object.fromEntries(Object.entries(GuitarNotesConfig).map(([key, value]) => {
      return [key, `${url}/${value.replace('[mp3|ogg]', extension)}`]
    }))
  }
}
