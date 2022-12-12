export function prettyNameOrDefault(rawName: string, fb: string) {
    var pretty = rawName.replace(/' '/g, ' ').trim()
    return pretty.length > 0 ? pretty : fb
}