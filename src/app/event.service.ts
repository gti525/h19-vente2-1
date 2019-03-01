import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Event } from './models/event';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  apiURL = 'https://vente2-gti525.herokuapp.com/api'

  constructor(private httpClient: HttpClient) {}
  
  public getEventById(id: number){
    return this.httpClient.get(`${this.apiURL}/event/${id}`);
  }

  public getEvents(){
    return this.httpClient.get(this.apiURL +  '/events');
  }
}