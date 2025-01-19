import {BarResponse} from "../interfaces/transcribe-response.interface";
import {TimeSignature} from "../types/time-signature.type";


export class Transcript {
    bars?: BarResponse[][];

    timeSignature?: TimeSignature;

    constructor(data: Transcript) {
        Object.assign(this, data);
    }
}
