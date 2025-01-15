import {inject, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {enviroment} from "../../environments/environment";
import {map, Observable} from "rxjs";
import {TranscribeResponse} from "../interfaces/transcribe-response.interface";


@Injectable({providedIn: 'root'})
export class TranscribeService {
  private readonly http: HttpClient = inject(HttpClient);

  transcribe(audio: FormData): Observable<TranscribeResponse>{
    return this.http
      .post(enviroment.api + '/transcribe', audio)
      .pipe(map(res => res as TranscribeResponse));
  }

}
