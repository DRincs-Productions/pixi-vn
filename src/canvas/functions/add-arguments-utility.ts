/**
 * Normalize the arguments of the `add*`/`show*` functions, which accept both
 * `(alias, url?, options?)` and `(alias, options?)`. In the second form the alias is used as the asset alias.
 * @param urlOrOptions The second argument: the url/alias of the asset, or the options.
 * @param options The third argument: the options.
 * @returns The url (or `undefined`, meaning "use the alias") and the options.
 */
export function splitUrlAndOptions<O extends object>(
    urlOrOptions: string | O | undefined,
    options: O | undefined,
): { url: string | undefined; options: O | undefined } {
    if (typeof urlOrOptions === "string" || urlOrOptions === undefined) {
        return { url: urlOrOptions, options };
    }
    return { url: undefined, options: urlOrOptions };
}
