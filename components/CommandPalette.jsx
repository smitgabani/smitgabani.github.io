/**
 * Command Palette Component
 * Keyboard-driven navigation (CMD+K / CTRL+K)
 * Quick access to sections, projects, social links, and actions
 *
 * Controlled: the parent owns `open` so other UI (e.g. the navbar search
 * button) can open it too.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Command } from 'cmdk';
import toast from 'react-hot-toast';
import Icon from './Icon';
import { trackButtonClick } from './Analytics';
import { copyToClipboard } from '../lib/utils/clipboard';
import { SECTIONS, scrollToSection } from '../lib/sections';

// Score an item against the query: label matches beat keyword matches.
// Substring/word-start matching only — cmdk's default fuzzy scoring matched
// "email" against project descriptions and ranked them above the Email item.
function scoreItem(item, query) {
  const label = item.label.toLowerCase();
  if (label.startsWith(query)) return 1;
  if (label.split(/\s+/).some((word) => word.startsWith(query))) return 0.9;
  if (label.includes(query)) return 0.8;
  const keywordWords = (item.keywords || []).flatMap((keyword) =>
    keyword.toLowerCase().split(/[^a-z0-9]+/)
  );
  if (keywordWords.some((word) => word.startsWith(query))) return 0.5;
  return 0;
}

// Filter and sort ourselves (cmdk's own group sorting didn't reorder groups):
// best-matching items first within each group, best-matching group first.
function filterGroups(groups, search) {
  const query = search.trim().toLowerCase();
  if (!query) return groups;

  return groups
    .map((group) => {
      const items = group.items
        .map((item) => ({ item, score: scoreItem(item, query) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score);
      return { ...group, items: items.map(({ item }) => item), best: items[0]?.score ?? 0 };
    })
    .filter((group) => group.items.length > 0)
    .sort((a, b) => b.best - a.best);
}

export default function CommandPalette({
  open,
  onOpenChange,
  projects = [],
  socialLinks = {},
}) {
  const router = useRouter();
  const returnFocusRef = useRef(null);
  const [search, setSearch] = useState('');

  // Toggle command palette with CMD+K or CTRL+K
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  // Lock body scroll while open, reset the query and restore focus on close
  useEffect(() => {
    if (!open) return;

    returnFocusRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
      setSearch('');
      // preventScroll so restoring focus doesn't cancel a section scroll
      returnFocusRef.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  const groups = useMemo(() => {
    const openLink = (url, label) => {
      window.open(url, '_blank', 'noopener,noreferrer');
      trackButtonClick(label, 'Command Palette');
    };

    const links = [
      socialLinks.github && {
        id: 'github',
        icon: 'github',
        label: 'GitHub',
        description: 'View my repositories',
        run: () => openLink(socialLinks.github, 'GitHub'),
      },
      socialLinks.linkedin && {
        id: 'linkedin',
        icon: 'external',
        label: 'LinkedIn',
        description: 'Connect with me',
        run: () => openLink(socialLinks.linkedin, 'LinkedIn'),
      },
      socialLinks.twitter && {
        id: 'twitter',
        icon: 'external',
        label: 'Twitter',
        description: 'Follow me',
        run: () => openLink(socialLinks.twitter, 'Twitter'),
      },
      socialLinks.email && {
        id: 'email',
        icon: 'mail',
        label: 'Email',
        description: socialLinks.email.replace(/^mailto:/, ''),
        keywords: ['mail', 'contact'],
        run: () => {
          window.location.href = socialLinks.email;
          trackButtonClick('Email', 'Command Palette');
        },
      },
    ].filter(Boolean);

    const actions = [
      {
        id: 'copy-url',
        icon: 'link',
        label: 'Copy Page URL',
        keywords: ['share', 'link'],
        run: async () => {
          const copied = await copyToClipboard(window.location.href);
          if (copied) {
            toast.success('Page URL copied');
          } else {
            toast.error('Could not copy the URL');
          }
        },
      },
    ].filter(Boolean);

    return [
      {
        heading: 'Navigation',
        items: SECTIONS.map((section) => ({
          id: `section-${section.id}`,
          icon: section.icon,
          label: section.label,
          run: () => {
            if (scrollToSection(section.id)) {
              trackButtonClick(`Navigate to ${section.id}`, 'Command Palette');
            }
          },
        })),
      },
      {
        heading: 'Projects',
        items: projects.map((project) => ({
          id: `project-${project.slug}`,
          icon: 'folder',
          label: project.title,
          description: project.subtitle,
          keywords: [project.category, ...(project.tech || [])].filter(Boolean),
          run: () => {
            router.push(`/projects/${project.slug}`);
            trackButtonClick(`Open ${project.title}`, 'Command Palette');
          },
        })),
      },
      { heading: 'Links', items: links },
      { heading: 'Actions', items: actions },
    ].filter((group) => group.items.length > 0);
  }, [projects, socialLinks, router]);

  const visibleGroups = useMemo(() => filterGroups(groups, search), [groups, search]);

  if (!open) return null;

  const close = () => onOpenChange(false);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command menu"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Command Palette */}
      <Command
        className="relative w-full max-w-2xl bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden"
        label="Command Menu"
        shouldFilter={false}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            close();
          }
        }}
      >
        {/* Search Input */}
        <div className="flex items-center border-b border-gray-700 px-4">
          <Icon name="search" className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search sections, projects, links..."
            className="w-full bg-transparent py-4 text-gray-100 placeholder-gray-500 outline-none text-base"
            autoFocus
          />
        </div>

        {/* Results */}
        <Command.List className="max-h-[400px] overflow-y-auto p-2">
          <Command.Empty className="px-4 py-8 text-center text-gray-500 text-sm">
            No results found.
          </Command.Empty>

          {visibleGroups.map((group) => (
            <Command.Group key={group.heading} heading={group.heading}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.id}
                  item={item}
                  onSelect={() => {
                    close();
                    item.run();
                  }}
                />
              ))}
            </Command.Group>
          ))}
        </Command.List>

        {/* Footer */}
        <div className="border-t border-gray-700 px-4 py-2 bg-gray-800/50">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-900/50 rounded text-xs border border-gray-600">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-900/50 rounded text-xs border border-gray-600">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-900/50 rounded text-xs border border-gray-600">Esc</kbd>
              Close
            </span>
          </div>
        </div>
      </Command>
    </div>
  );
}

// Command Item Component
function CommandItem({ item, onSelect }) {
  return (
    <Command.Item
      value={item.id}
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-300 transition-colors duration-150 data-[selected=true]:bg-purple-600/90 data-[selected=true]:text-white group"
    >
      <Icon
        name={item.icon}
        className="w-5 h-5 flex-shrink-0 text-gray-500 group-data-[selected=true]:text-white"
      />
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium truncate">{item.label}</span>
        {item.description && (
          <span className="text-xs text-gray-500 group-data-[selected=true]:text-purple-100 truncate">
            {item.description}
          </span>
        )}
      </div>
    </Command.Item>
  );
}
