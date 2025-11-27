// ==UserScript==
// @name         Remove "Tutor" button from Edgenuity
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  The button is annoying, so I removed it.
// @author       ButterBoyyo
// @match        https://r19.core.learn.edgenuity.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=edgenuity.com
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const SELECTOR = '.gp-button';

  // Fast & simple: inject CSS to hide the button (useful as immediate protection)
  const style = document.createElement('style');
  style.textContent = `${SELECTOR} { display: none !important; visibility: hidden !important; }`;
  document.head?.appendChild(style);

  // Remove matching nodes under a given root (Document or ShadowRoot)
  function removeElements(root = document) {
    try {
      const nodes = (root instanceof Document || root instanceof ShadowRoot)
        ? root.querySelectorAll(SELECTOR)
        : [];
      nodes.forEach(n => n.remove());
    } catch (e) {
      // ignore cross-origin shadow/document exceptions
      console.error('removeElements error', e);
    }
  }

  // Observe a root (Document or ShadowRoot) for additions and attribute changes
  function observeRoot(root) {
    try {
      const obs = new MutationObserver(mutations => {
        // On any relevant mutation, a full sweep is cheap for a single selector
        removeElements(root);
      });
      obs.observe(root instanceof Document ? (root.documentElement || root.body) : root, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });
      // initial pass for this root
      removeElements(root);
    } catch (e) {
      console.error('observeRoot error', e);
    }
  }

  // Hook attachShadow to observe new shadow roots created after this script runs
  (function hookAttachShadow() {
    try {
      const proto = Element.prototype;
      if (!proto.__attachShadowHooked) {
        const orig = proto.attachShadow;
        proto.attachShadow = function (init) {
          const sr = orig.call(this, init);
          // observe the newly created shadow root
          observeRoot(sr);
          return sr;
        };
        proto.__attachShadowHooked = true;
      }
    } catch (e) {
      console.error('attachShadow hook failed', e);
    }
  })();

  // Observe existing shadow roots in the document (if any)
  function scanExistingShadowRoots() {
    try {
      const all = document.querySelectorAll('*');
      all.forEach(el => {
        if (el.shadowRoot) observeRoot(el.shadowRoot);
      });
    } catch (e) {
      console.error('scanExistingShadowRoots error', e);
    }
  }

  // Main initialization
  (function init() {
    // immediate removal in the main document
    removeElements(document);

    // observe the main document
    observeRoot(document);

    // find & observe any existing shadow roots
    scanExistingShadowRoots();

    // Optional fallback: periodic sweep (uncomment if needed)
    // setInterval(() => removeElements(document), 1500);
  })();

})();
