# Message Types

This document catalogues the message types and purposes passed between our UI and Service Worker.

## Message Format

## Message Types

### artifactDetailsFromServiceWorker

**Scope: [chrome.tabs](https://developer.chrome.com/docs/extensions/reference/tabs/)**

### changedURLOnPage

**Scope: [chrome.tabs](https://developer.chrome.com/docs/extensions/reference/tabs/)**

Current Tab URL has changed.

### getArtifactDetailsFromPurl

**Scope: [chrome.runtime](https://developer.chrome.com/docs/extensions/reference/runtime/)**

Obtain detail of a Component by PURL from the configured data source.

### togglePage

**Scope: [chrome.runtime](https://developer.chrome.com/docs/extensions/reference/runtime/)**

Enable or disable this clickable Chrome Extension.

Used when navigating to sites that we do not support - disable ability to attempt lookup (as it will fail).