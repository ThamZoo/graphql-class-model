declare module '*.vert';
declare module '*.frag';
declare module '*.module.css';
declare module '*.module.scss';
declare module '*.module.sass';
declare module '*.module.less';

declare enum __VERSION__ {}

export {};

declare global {
  type int = number;
  type date = any;
  type Id = any;
}
