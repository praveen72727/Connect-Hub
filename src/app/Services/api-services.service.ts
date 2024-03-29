import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {Message} from '../modals/messages';

@Injectable({
  providedIn: 'root'
})
export class ApiServicesService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private httpClient: HttpClient,  private http:HttpClient) { }

  fetchMessages(){
  return this.http.get<{[key:string]:Message}>('https://connecthub-6f9e0-default-rtdb.firebaseio.com/messages.json')
  .pipe(map((res) => {
    const messages = [];
    for (const key in res) {
      if (res.hasOwnProperty(key)) {
        messages.push({ ...res[key], id: key })
      }
    }
    return messages;
  }))
  }
}
