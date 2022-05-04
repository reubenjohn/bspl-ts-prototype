export function minus<A extends object, B extends object>(from: A, toRemove: B): Exclude<A, B> {
    const result: { [key: string]: any } = {};
    for (let key in from)
        if (!(key in toRemove))
            result[key] = from[key];
    return <Exclude<A, B>>result;
}