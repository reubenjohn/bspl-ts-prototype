type FilteredProperties<SRC extends object, KEYS extends (keyof SRC)[]> = { [K in KEYS[number]]: SRC[K] };

export function filterProperties<SRC extends object>(source: SRC, keysToKeep: (keyof SRC)[]): SRC {
    const result: Partial<SRC> = {};
    for (let key of keysToKeep)
        result[key] = source[key];
    return <FilteredProperties<SRC, typeof keysToKeep>>result;
}

export function containsProperties(obj: object, keys: string[]): boolean {
    for (let paramName of keys)
        if (!(paramName in obj))
            return false;
    return true;
}

export function minus<A extends object, B extends object>(from: A, toRemove: B): Exclude<A, B> {
    const result: { [key: string]: any } = {};
    for (let key in from)
        if (!(key in toRemove))
            result[key] = from[key];
    return <Exclude<A, B>>result;
}