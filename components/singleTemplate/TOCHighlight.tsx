'use client';
import { useEffect } from 'react';

export default function TocHighlightClient() {
    useEffect(() => {
        const toc = document.getElementById('page-toc');
        if (!toc) return;

        const links = Array.from(toc.querySelectorAll('a')) as HTMLAnchorElement[];
        const idToLink = new Map(links.map((l) => [l.getAttribute('href')?.slice(1), l]));

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const id = entry.target.getAttribute('id');
                    if (!id) return;
                    const link = idToLink.get(id);
                    if (!link) return;
                    if (entry.isIntersecting) {
                        link.classList.add('font-semibold', 'text-accent');
                    } else {
                        link.classList.remove('font-semibold', 'text-accent');
                    }
                });
            },
            { root: null, rootMargin: '0px 0px -60% 0px', threshold: 0 }
        );

        // Observe headings in the rendered markdown
        const targets = Array.from(
            document.querySelectorAll('.markdown-body h1[id], .markdown-body h2[id], .markdown-body h3[id], .markdown-body h4[id]')
        );
        targets.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return null;
}
