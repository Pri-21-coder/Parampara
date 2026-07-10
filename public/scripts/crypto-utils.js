/**
 * crypto-utils.js
 * Utility functions for client-side End-to-End Encryption using the Web Crypto API
 */

const CryptoUtils = {
  // Generate a new RSA-OAEP key pair for a user
  generateRSAKeyPair: async () => {
    return await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true, // extractable
      ["encrypt", "decrypt"]
    );
  },

  // Export a key to JWK format for storage/transmission
  exportKey: async (key) => {
    return await window.crypto.subtle.exportKey("jwk", key);
  },

  // Import a key from JWK format
  importKey: async (jwk, type) => {
    return await window.crypto.subtle.importKey(
      "jwk",
      jwk,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      type === 'public' ? ["encrypt"] : ["decrypt"]
    );
  },

  // Generate an AES-GCM key for symmetric encryption of a specific archive
  generateAESKey: async () => {
    return await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  },

  // Encrypt an AES key using a recipient's RSA public key
  encryptAESKeyWithRSA: async (aesKey, rsaPublicKey) => {
    const exportedAesKey = await window.crypto.subtle.exportKey("raw", aesKey);
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP"
      },
      rsaPublicKey,
      exportedAesKey
    );
    // Convert ArrayBuffer to Base64 for easier transmission
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  },

  // Decrypt an AES key using the user's RSA private key
  decryptAESKeyWithRSA: async (encryptedAesKeyBase64, rsaPrivateKey) => {
    const encryptedBytes = Uint8Array.from(atob(encryptedAesKeyBase64), c => c.charCodeAt(0));
    const decryptedBytes = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP"
      },
      rsaPrivateKey,
      encryptedBytes
    );
    return await window.crypto.subtle.importKey(
      "raw",
      decryptedBytes,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  },

  // Encrypt plaintext content with an AES key
  encryptContent: async (contentStr, aesKey) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(contentStr);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encryptedContent = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      aesKey,
      data
    );

    return {
      ciphertext: btoa(String.fromCharCode(...new Uint8Array(encryptedContent))),
      iv: btoa(String.fromCharCode(...iv))
    };
  },

  // Decrypt ciphertext content with an AES key
  decryptContent: async (ciphertextBase64, ivBase64, aesKey) => {
    const ciphertextBytes = Uint8Array.from(atob(ciphertextBase64), c => c.charCodeAt(0));
    const ivBytes = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));

    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBytes
      },
      aesKey,
      ciphertextBytes
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedContent);
  },
  // Normalize an object to ensure deterministic hashing
  normalizeObject: (obj) => {
    if (obj === null || typeof obj !== 'object') {
      if (typeof obj === 'string') return obj.trim();
      return obj;
    }
    if (obj instanceof Date) {
      return obj.toISOString();
    }
    if (Array.isArray(obj)) {
      return obj.map(CryptoUtils.normalizeObject);
    }
    const sortedKeys = Object.keys(obj).sort();
    const result = {};
    for (const key of sortedKeys) {
      if (key !== 'hash' && key !== '_verified') {
        result[key] = CryptoUtils.normalizeObject(obj[key]);
      }
    }
    return result;
  },

  // Generate a SHA-256 hash for an object
  hashObject: async (obj) => {
    const normalized = CryptoUtils.normalizeObject(obj);
    const jsonStr = JSON.stringify(normalized) || '';
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonStr);
    
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  },

  // Verify if the object's computed hash matches its expected hash
  verifyHash: async (obj, expectedHash) => {
    if (!expectedHash) return false;
    const computedHash = await CryptoUtils.hashObject(obj);
    return computedHash === expectedHash;
  }
};

window.CryptoUtils = CryptoUtils;
