export function toJSONBytes(thing: any): Uint8Array {
    return Uint8Array.from(
        JSON.stringify(thing)
            .split("")
            .map(x => x.charCodeAt(0))
    )
}

export function fromJSONBytes(bytes: Uint8Array): any {
    if (!bytes || bytes.length == 0) return undefined

    return JSON.parse(new TextDecoder().decode(bytes))
}

export function toJSON(thing: any): string {
    return JSON.stringify(thing)
}

export function fromJSON(text: string): any {
    return JSON.parse(text)
}