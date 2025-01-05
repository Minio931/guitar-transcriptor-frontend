


export function DeepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}
