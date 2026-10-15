// Files in /public are not prefixed with the Pages base path automatically.
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`;
