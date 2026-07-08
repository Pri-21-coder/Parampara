/**
 * integrityBadge.js
 * Utility to render integrity verification badges for cultural items.
 */

const IntegrityBadge = {
  /**
   * Renders a badge indicating the integrity status of an item.
   * @param {Object} item The item to verify (must have `hash` and `_verified` properties).
   * @returns {HTMLElement} The badge element.
   */
  renderBadge: (item) => {
    const badge = document.createElement('span');
    badge.className = 'integrity-badge';
    badge.style.display = 'inline-flex';
    badge.style.alignItems = 'center';
    badge.style.padding = '2px 6px';
    badge.style.borderRadius = '12px';
    badge.style.fontSize = '0.75rem';
    badge.style.fontWeight = 'bold';
    badge.style.marginLeft = '8px';
    badge.style.verticalAlign = 'middle';
    badge.style.cursor = 'help';

    if (!item.hash) {
      badge.style.backgroundColor = '#f3f4f6';
      badge.style.color = '#6b7280';
      badge.innerHTML = '🛡️ Unverified';
      badge.title = 'This item was created before integrity hashing was enabled.';
    } else if (item._verified) {
      badge.style.backgroundColor = '#def7ec';
      badge.style.color = '#03543f';
      badge.innerHTML = '✅ Verified';
      badge.title = 'Content integrity verified via SHA-256 hash.';
    } else {
      badge.style.backgroundColor = '#fde8e8';
      badge.style.color = '#9b1c1c';
      badge.innerHTML = '⚠️ Tampered';
      badge.title = 'Integrity check failed! Content may have been altered.';
    }

    return badge;
  },

  /**
   * Automatically verifies an item and attaches the `_verified` property.
   * @param {Object} item The item to verify.
   */
  verifyItem: async (item) => {
    if (item.hash) {
      item._verified = await window.CryptoUtils.verifyHash(item, item.hash);
      if (!item._verified) {
        console.warn(`Integrity check failed for item: ${item.id || 'unknown'}`);
      }
    } else {
      item._verified = false;
    }
  }
};

window.IntegrityBadge = IntegrityBadge;
