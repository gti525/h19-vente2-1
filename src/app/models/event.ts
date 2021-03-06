import { Venue } from './venue';

export class Event {
    id: number;
    title: string;
    description: string;
    organisation: string;
    artist: string;
    dateEvent: Date;
    image: string;
    saleStatue: number;
    venue: Venue;
}