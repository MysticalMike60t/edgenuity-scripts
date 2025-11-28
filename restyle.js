// ==UserScript==
// @name         Edgenuity Restyle
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  Injects and maintains restyle CSS across the page, same-origin iframes and shadow roots. Re-inserts if overwritten/removed by the site so styles stay applied.
// @author       ButterBoyyo
// @match        https://r19.core.learn.edgenuity.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=edgenuity.com
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // ---------- CONFIG ----------
    const GLOBAL_CSS = `
:root {
  --background-color: #333;
  --background-color-secondary: rgb(35,35,35);
  --primary-color: #dc4e12;
  --success-color: #5cb85c;
  --info-color: #40a7db;
  --border-color: rgb(65,65,65);
  --border-color-lighter: rgb(85,85,85);
  --text-color: white;
  --text-color-alternate: black;

  --done-button-icon: url("https://images.vexels.com/media/users/3/157890/isolated/preview/4f2c005416b7f48b3d6d09c5c6763d87-check-mark-circle-icon.png");
}
* {
  text-shadow: none !important;
}
body {
  background: var(--background-color) !important;
}
/* Title bar styles (force with !important) */
.title-bar {
  background: var(--background-color) !important;
  color: var(--text-color) !important;
}
.title-bar, .title-bar * { color: var(--text-color) !important; }

/* Hide known Tutor controls (best-effort) */
.tutor, .tutor-button, .btn-tutor, [aria-label*="Tutor"], [title*="Tutor"] {
  display: none !important;
  visibility: hidden !important;
}

/* Marker for elements hidden by this script */
[data-restyle-hidden="true"] { display: none !important; visibility: hidden !important; }

#btnEntryAudio {
  background: var(--background-color) !important;
  color: var(--text-color) !important;
  border: none !important;
  outline: 1px solid var(--info-color) !important;
  border-radius: 0 !important;
}
#btnEntryAudio:hover, #btnExitAudio:hover {
  background: var(--background-color) !important;
}
#btnEntryAudio .icon-qb-audio1, #btnExitAudio .icon-qb-audio1 {
  display: none;
}
#btnEntryAudio *, #btnExitAudio * {
  text-shadow: none !important;
}
#btnCheck {
  background: var(--background-color) !important;
  color: var(--text-color) !important;
  border: none !important;
  outline: 1px solid var(--success-color) !important;
  border-radius: 0 !important;
}
#btnCheck .icon-qb-check1 {
  display: none !important;
}
#btnCheck::after {
  --size: 20px;

  content: "";
  width: var(--size);
  height: var(--size);
  background-image: var(--done-button-icon);
  background-position: center;
  background-size: contain;
  left: 4px;
  top: 4px;
  position: absolute;
}
#frameAudioControls, .question-container, .content, #frameArea, .bottom-tray, .mainfoot, .activityActive, .Toolbar {
  background: var(--background-color) !important;
}
.ui-tabs-tab {
  background: var(--background-color) !important;
  border: none !important;
  outline: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  text-shadow: none !important;
}
.ui-tabs-tab::before {
  display: none !important;
}
.ui-tabs-tab::after {
  display: none !important;
}
.ui-tabs-tab *, .footnav *, .Practice_Question_Body * {
  color: var(--text-color) !important;
  text-shadow: none !important;
}
.nav-icon, .FrameLeft a, .FrameRight a {
  border: 1px solid var(--primary-color) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
.nav-icon.disabled {
  border: 1px solid var(--border-color) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
.footnav .nav-icon {
  margin-right: 20px !important;
  margin-left: 20px !important;
}
.mainfoot {
  box-shadow: none !important;
  border-top: 1px solid var(--border-color) !important;
}
.FramesList li:not('.FrameCurrent','.FrameComplete','.FrameLeft','.FrameRight') a {
  background-image: none !important;
  background-color: var(--background-color) !important;
  border: 1px solid var(--border-color) !important;
}
.FrameCurrent a {
  background-image: none !important;
  background-color: var(--primary-color) !important;
  border: 1px solid var(--primary-color) !important;
}
.FrameComplete a {
  background-image: none !important;
  background-color: var(--background-color) !important;
  border: 1px solid var(--primary-color) !important;
}
.vcplayer {
  -webkit-box-shadow: none !important;
}
.vcplayer .controls {
  border: 1px solid var(--background-color) !important;
  background-image: none !important;
  background-color: var(--background-color) !important;
  outline: 1px solid var(--background-color) !important;
}
.vcplayer .controls li {
  border: none !important;
}
#uid1_played {
  background: var(--primary-color) !important;
}
.ui-tabs-nav {
  background: var(--background-color-secondary) !important;
  border: none !important;
}
.mainhead {
  background: var(--background-color) !important;
  box-shadow: none !important;
  border-bottom: 1px solid var(--border-color) !important;
}
.mainhead * {
  border: none !important;
}
.toolbar {
  border: 1px solid var(--border-color) !important;
}
.toolbar li {
  border: none !important;
}
.overlay-attempt {
  box-shadow: none !important;
}
.overlay-attempt-primary-section *, .overlay-attempt-header {
  border: none !important;
}
.lesson-pane-trigger {
  border-radius: 0 !important;
  border: 1px solid var(--border-color) !important;
  border-right: none !important;
  background: var(--background-color) !important;
  box-shadow: none !important;
}
#home_video_container {
  outline: 1px solid var(--border-color) !important;
}
.gradebar {
  background: var(--success-color) !important;
  border: 1px solid var(--success-color) !important;
}
.goRight, .goLeft {
  border: none !important;
  outline: none !important;
}
.ui-tabs-active {
  background: var(--border-color) !important;
  border-radius: 0 !important;
}
.content * {
  color: var(--text-color) !important;
}
.head-nav .parent {
  border: none !important;
  outline: none !important;
}
.JQueryTabbify {
  background: var(--background-color) !important;
  border: 1px solid var(--border-color) !important;
}
.ui-state-default {
  outline: none !important;
  border: none !important;
  border-radius: 0 !important;
  background: var(--background-color-secondary) !important;
}
.ui-state-active {
  background: var(--background-color) !important;
}
.reading.pane-blue * {
  color: black !important;
}
.Practice_Question_Body select {
  background: var(--background-color) !important;
  border: none !important;
  outline: 1px solid var(--border-color-lighter) !important;
  margin: 2px;
}
.Practice_Question_Body select * {
  color: var(--text-color) !important;
}
.sbgTile {
  background: var(--background-color) !important;
  border: 1px solid var(--border-color-lighter) !important;
  box-shadow: none !important;
}
.catLabel {
  background: var(--background-color-secondary) !important;
  border-bottom: 1px solid var(--border-color-lighter) !important;
}
.sbgColumn {
  border: 1px solid var(--border-color-lighter) !important;
}
.leftColumn {
  border: 1px solid var(--border-color) !important;
}
#frameAudioControls {
  border-top: 1px solid var(--border-color) !important;
}
.sbgAlert {
  background: var(--background-color) !important;
}
.matchColumnItem {
  background: var(--background-color) !important;
  border: 1px solid var(--border-color-lighter) !important;
}
.bottomSection, .matchLeftColumn, .matchRightColumn, .matchMiddleColumn {
  background: var(--background-color) !important;
}
.Wirisformula {
  background: white !important;
  padding: 5px 10px !important;
}
input {
  background: var(--background-color) !important;
  border: 1px solid (--border-color) !important;
  outline: 1px solid (--border-color) !important;
  color: var(--text-color) !important;
}
#btnExitAudio {
  background: var(--background-color) !important;
  color: var(--text-color) !important;
  border: none !important;
  outline: 1px solid var(--error-color) !important;
  border-radius: 0 !important;
}
#nextQuestion {
  background-image: none !important;
  background: var(--background-color) !important;
  color: var(--text-color) !important;
  border: none !important;
  outline: 1px solid var(--border-color) !important;
  border-radius: 0 !important;
}
#submit {
  background: var(--background-color) !important;
  color: var(--text-color) !important;
  border: none !important;
  outline: 1px solid var(--success-color) !important;
  border-radius: 0 !important;
}
.av-container .nav-bar, .av-container .nav-bar-review {
  --padding: 5px;

  padding-left: calc(var(--padding)*2) !important;
  padding-right: calc(var(--padding)*2) !important;
  padding-top: calc(var(--padding)/2) !important;
}
p, .bottom-tray div, .icon-success5 {
  color: var(--text-color) !important;
}
.Assessment_Main_Body_Content_Question .Practice_Question_Body:has(.answer-choice .answer-choice-label img) {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: row;
}
`.trim();

    function changeText() {
        document.querySelector(".icon-qb-audio1").innerHTML="Replay Intro";
    }

    // A stable id derived from content so we can detect if the site's overwritten the style
    const STYLE_ID = 'restyle-global-' + hashString(GLOBAL_CSS);

    // ---------- Helpers ----------
    function hashString(s) {
        let h = 0;
        for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i) | 0;
        return 'h' + (h >>> 0).toString(36);
    }

    function createStyleElement(css) {
        const style = document.createElement('style');
        style.setAttribute('data-restyle-style-id', STYLE_ID);
        style.setAttribute('data-restyle-generated', '1');
        style.textContent = css;
        return style;
    }

    // Insert style into a Document or ShadowRoot root. Returns true if inserted/updated.
    function injectStyleToRoot(root, css) {
        try {
            if (!root) return false;

            // Try to detect existing style by data attribute
            let existing = null;
            try {
                if (root.querySelector) existing = root.querySelector('style[data-restyle-style-id="' + STYLE_ID + '"]');
            } catch (e) {
                // root might be a shadow root or doc; ignore selector errors
                existing = null;
            }

            if (existing) {
                // If the content has changed (site removed/modified), re-set it
                if (existing.textContent !== css) existing.textContent = css;
                return true;
            }

            // If root is a Document, prefer putting into <head>, else append to root
            const style = (root.ownerDocument || document).createElement('style');
            style.setAttribute('data-restyle-style-id', STYLE_ID);
            style.setAttribute('data-restyle-generated', '1');
            style.textContent = css;

            if (root.nodeType === Node.DOCUMENT_NODE) {
                // root is Document
                const head = root.head || root.getElementsByTagName('head')[0];
                if (head && head.appendChild) head.appendChild(style);
                else root.documentElement.insertBefore(style, root.body || null);
            } else if (root instanceof ShadowRoot) {
                // append to shadow root
                root.appendChild(style);
            } else {
                // fallback: append to root if possible
                if (root.appendChild) root.appendChild(style);
                else (root.ownerDocument || document).head.appendChild(style);
            }
            return true;
        } catch (err) {
            // Can't inject into this root (maybe cross-origin iframe), ignore.
            return false;
        }
    }

    // A deep walker that visits document, reachable shadow roots, and same-origin iframes and invokes cb(root)
    function deepWalkRoots(cb) {
        const visited = new Set();

        function walkRoot(root) {
            if (!root || visited.has(root)) return;
            visited.add(root);
            try { cb(root); } catch (e) { /* swallow cb errors per-root */ }

            // Query elements to find nested shadow roots and iframes
            let nodes = [];
            try { nodes = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : []; } catch (e) { nodes = []; }

            for (const el of nodes) {
                // shadow root
                if (el.shadowRoot) walkRoot(el.shadowRoot);
                // same-origin iframe
                if (el.tagName === 'IFRAME') {
                    try {
                        const doc = el.contentDocument;
                        if (doc) walkRoot(doc);
                    } catch (err) {
                        // cross-origin iframe — cannot access
                    }
                }
            }
        }

        walkRoot(document);
    }

    // Ensure styles exist across roots. returns an object with counts.
    function ensureStylesPresent() {
        let inserted = 0;
        let updated = 0;
        deepWalkRoots((root) => {
            const ok = injectStyleToRoot(root, GLOBAL_CSS);
            if (ok) inserted++;
        });
        return { rootsTouched: inserted };
    }

    // If the style element is removed/changed by the site we should re-insert it.
    // Observe document/head for removals and re-apply as needed. Also watch for iframe additions.
    function startMaintenance() {
        const observer = new MutationObserver((mutations) => {
            let needReapply = false;
            for (const m of mutations) {
                // If nodes removed/added or attributes changed, re-check
                if (m.type === 'childList' && (m.removedNodes.length > 0 || m.addedNodes.length > 0)) { needReapply = true; break; }
                if (m.type === 'attributes') { needReapply = true; break; }
            }
            if (needReapply) {
                try { ensureStylesPresent(); } catch (e) { /* ignore */ }
            }
        });

        // Observe top-level documentElement (covers head replacement) and body when available
        const target = document.documentElement || document;
        try {
            observer.observe(target, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'id', 'style'] });
        } catch (e) {
            // fallback to observing body later
            if (document.body) observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'id', 'style'] });
        }

        // Also observe additions of iframes specifically so we can inject into their docs when they become available
        const iframeObserver = new MutationObserver((mutations) => {
            for (const m of mutations) {
                if (m.type === 'childList' && m.addedNodes.length > 0) {
                    for (const n of m.addedNodes) {
                        if (n.nodeType === Node.ELEMENT_NODE && n.tagName === 'IFRAME') {
                            try {
                                // Try to inject when iframe contentDocument is available
                                if (n.contentDocument) injectStyleToRoot(n.contentDocument, GLOBAL_CSS);
                                // else wait for load
                                n.addEventListener('load', () => {
                                    try { if (n.contentDocument) injectStyleToRoot(n.contentDocument, GLOBAL_CSS); } catch (e) { /* ignore */ }
                                }, { once: true });
                            } catch (e) { /* ignore cross-origin */ }
                        }
                    }
                }
            }
        });

        try {
            const rootForIframes = document.body || document.documentElement;
            if (rootForIframes) iframeObserver.observe(rootForIframes, { childList: true, subtree: true });
        } catch (e) { /* ignore */ }

        // Periodic sanity check: re-run ensureStylesPresent occasionally in case the site aggressively mutates DOM
        const SANITY_INTERVAL_MS = 4000;
        setInterval(() => {
            try { ensureStylesPresent(); } catch (e) { /* ignore */ }
        }, SANITY_INTERVAL_MS);
    }

    // ---------- Startup ----------
    // Try to inject as early as possible. If head isn't present yet, inject into documentElement or create head.
    (function initialInject() {
        try {
            // If head missing (document-start), create a temporary head so style can be attached early
            if (!document.head && document.documentElement) {
                const head = document.createElement('head');
                document.documentElement.insertBefore(head, document.documentElement.firstChild);
            }
            ensureStylesPresent();
        } catch (e) {
            // ignore
        }
    })();

    // Start maintenance once DOM is interactive so we can observe replacements reliably
    function onReady() {
        try {
            startMaintenance();
            // do a few delayed ensures for SPAs
            setTimeout(() => { try { ensureStylesPresent(); } catch (e) {} }, 200);
            setTimeout(() => { try { ensureStylesPresent(); } catch (e) {} }, 1200);
            setTimeout(() => { try { ensureStylesPresent(); } catch (e) {} }, 4000);
        } catch (e) { /* ignore */ }
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', onReady, { once: true });
        // fallback
        setTimeout(onReady, 2000);
    } else {
        onReady();
    }

    // ---------- Diagnostics API ----------
    window.RestyleEdgenuity = window.RestyleEdgenuity || {};
    Object.assign(window.RestyleEdgenuity, {
        cssId: STYLE_ID,
        ensureStylesPresent,
        injectedCss: GLOBAL_CSS,
        whereInserted() {
            const roots = [];
            deepWalkRoots((root) => {
                try {
                    const found = root.querySelector ? root.querySelector('style[data-restyle-style-id="' + STYLE_ID + '"]') : null;
                    if (found) roots.push(root);
                } catch (e) { /* ignore cross-context selectors */ }
            });
            return roots.length;
        }
    });

    console.info('Restyle-Edgenuity: force-styles script loaded (style id: %s).', STYLE_ID);
})();
