import {TabulatureService} from "./tabulature.service";
import {inject, Injectable} from "@angular/core";
import * as Tone from "tone";
import {BarItem} from "../types/bar-item.type";
import {DeepCopy} from "../functions/deep-copy.function";
import {TabObjectType} from "../enums/tab-object-type.enum";
import {TimeSignature} from "../types/time-signature.type";
import {NoteEnum} from "../enums/note.enum";

const TEMPO = 20;

@Injectable({providedIn: 'root'})
export class PlaybackService {
  tabulatureService: TabulatureService = inject(TabulatureService);
  synth: Tone.PolySynth = new Tone.PolySynth().toDestination();

  playTabulature() {
    const bars = this.getNotes();
    let time = Tone.now();

    bars.forEach(bar => {
      bar.notes.forEach(column => {
        let duration = 0;
        column.forEach((note, index) => {
          if (note.tabObject?.fretNumber === undefined) return;

          const playableNote = this.getPlayableNote(note!.tabObject!.fretNumber!, index + 1);
          duration = this.calculatePlayDuration(note!.note!.type, bar.timeSignature);
          this.playNote(playableNote, duration, time);
        })
        time += duration;
      })
    })
  }

  private playNote(note: number, duration: number, time: number) {
    this.synth.triggerAttackRelease(Tone.Frequency(note, "midi").toNote(), duration, time);
  }

  private getNotes(): { notes: BarItem[][], timeSignature: TimeSignature }[] {
    const tabulation = DeepCopy(this.tabulatureService.tabulation());
    return tabulation.flatMap(row =>
      row.bars.flatMap(bar => {
        return {
          notes: bar.items.map(item => item.filter((item) => item.tabObject?.type === TabObjectType.Note)),
          timeSignature: bar.timeSignature
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
}
