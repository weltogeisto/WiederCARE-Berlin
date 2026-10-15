import type { CSSProperties } from "react";
const paths: Record<string, React.ReactNode> = {
 play: <path d="m9 5 11 7-11 7Z" />,
 pause: <><path d="M8 5v14M16 5v14" /></>,
 close: <path d="m6 6 12 12M18 6 6 18" />,
 arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
 gps: <><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2" /><path d="M12 1v4m0 14v4M1 12h4m14 0h4" /></>,
 sound: <><path d="m11 5-5 4H3v6h3l5 4ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" /></>,
 mute: <><path d="m11 5-5 4H3v6h3l5 4Z" /><path d="m16 9 5 6m0-6-5 6" /></>,
 plus: <path d="M12 5v14M5 12h14" />,
 reset: <><path d="M3 10a9 9 0 1 1 2 8M3 4v6h6" /></>,
 check: <path d="m5 12 4 4L19 6" />,
 info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10v.1" /></>,
 pin: <><path d="M19 10c0 6-7 11-7 11S5 16 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></>,
 camera: <><path d="M4 7h4l2-3h4l2 3h4v14H4Z" /><circle cx="12" cy="13" r="4" /></>,
 download: <><path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5" /></>,
 trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 10v7m4-7v7" /></>,
 book: <><path d="M12 6c-3-3-7-3-10-2v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 2Zm0 0v15" /></>,
 compass: <><circle cx="12" cy="12" r="9" /><path d="m16 8-3 5-5 3 3-5Z" /></>,
};
export default function Icon({ name, size = 20, style }: { name: string; size?: number; style?: CSSProperties }) {
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>{paths[name] ?? paths.info}</svg>;
}
