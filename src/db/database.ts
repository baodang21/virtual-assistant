import Dexie, { Table } from 'dexie';

export type EventStatus = 'ongoing' | 'canceled' | 'done';

export interface Event {
  id?: number;
  title: string;
  description: string;
  location: string;
  status: EventStatus;
  fromDatetime: string;
  toDatetime: string;
  createdAt?: Date;
}

export interface Appointment {
  id?: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  note: string;
  datetime: string;
  createdAt?: Date;
}

export class AppDatabase extends Dexie {
  events!: Table<Event>;
  appointments!: Table<Appointment>;

  constructor() {
    super('AppDB');
    
    this.version(2).stores({
      events: '++id, title, status, fromDatetime, toDatetime, createdAt',
      appointments: '++id, firstName, lastName, phone, datetime, createdAt'
    });

    // Migration from v1 to v2
    this.version(2).upgrade(tx => {
      return tx.table('events').toCollection().modify(event => {
        if ('datetime' in event) {
          event.fromDatetime = event.datetime;
          event.toDatetime = new Date(new Date(event.datetime).getTime() + 60 * 60 * 1000).toISOString();
          delete event.datetime;
        }
      });
    });
  }
}

export const db = new AppDatabase();