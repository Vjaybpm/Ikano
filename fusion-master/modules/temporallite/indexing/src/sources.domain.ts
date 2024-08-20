import { Authentication } from './authentication.domain';


export type SourceType = 'staticList' | 'file' | 'query';

export type StaticListSource = {
  method: 'staticList';
  details: string[]; // Comma separated list of items

}
export type FileSource = {
  method: 'file';
  details: string; // File path
}
export type QuerySource = {
  method: 'query';
  details: string; // Query string
}
export type Source = StaticListSource | FileSource | QuerySource;

export type OutlookDataSource = {
  type: 'Outlook';
  baseUrl: string;
  authentication: Authentication;
  emails: Source;
};

export type TeamsDataSource = {
  type: 'Teams';
  baseUrl: string;
  authentication: Authentication;
  channels: Source;
}

export type DataSource = OutlookDataSource | TeamsDataSource