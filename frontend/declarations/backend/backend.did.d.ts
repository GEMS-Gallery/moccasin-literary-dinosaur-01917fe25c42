import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface File {
  'content' : Uint8Array | number[],
  'name' : string,
  'size' : bigint,
  'uploadTime' : Time,
}
export type Result = { 'ok' : File } |
  { 'err' : string };
export type Result_1 = { 'ok' : null } |
  { 'err' : string };
export type Time = bigint;
export interface _SERVICE {
  'deleteFile' : ActorMethod<[string], Result_1>,
  'downloadFile' : ActorMethod<[string], Result>,
  'listFiles' : ActorMethod<[], Array<File>>,
  'uploadFile' : ActorMethod<[string, Uint8Array | number[]], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
