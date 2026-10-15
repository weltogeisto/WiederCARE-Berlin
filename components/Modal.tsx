"use client";
import { useEffect, useRef } from "react";
import Icon from "./Icon";
export default function Modal({ title, children, onClose, className = "" }: { title: string; children: React.ReactNode; onClose: () => void; className?: string }) {
 const ref = useRef<HTMLDialogElement>(null);
 useEffect(() => {
  const dialog = ref.current; const previous = document.activeElement as HTMLElement | null;
  dialog?.showModal(); const overflow = document.body.style.overflow; document.body.style.overflow = "hidden";
  return () => { dialog?.close(); document.body.style.overflow = overflow; previous?.focus(); };
 }, []);
 return <dialog ref={ref} className={`modal ${className}`} aria-label={title} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
  <div className="modal-inner"><header className="modal-header"><span className="eyebrow">{title}</span><button className="icon-button" onClick={onClose} aria-label="Schließen"><Icon name="close" /></button></header>{children}</div>
 </dialog>;
}
