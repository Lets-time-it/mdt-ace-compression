declare module 'deflate-js' {
    export function deflate(data:Array<number>, compression?: number):Array<number>;
    export function inflate(data:Array<number>):Array<number>;
}