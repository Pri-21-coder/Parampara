/**
 * archives.js
 * Logic for managing End-to-End Encrypted Private Family Archives
 */

document.addEventListener('DOMContentLoaded', () => {
  const userSelect = document.getElementById('currentUserSelect');
  const generateKeysBtn = document.getElementById('generate-keys-btn');
  const keyStatus = document.getElementById('key-status');
  const archivesLayout = document.getElementById('archives-layout-container');
  const shareWithSelect = document.getElementById('share-with');
  const createArchiveForm = document.getElementById('create-archive-form');
  const createStatus = document.getElementById('create-status');
  const archivesList = document.getElementById('archives-list');
  const refreshArchivesBtn = document.getElementById('refresh-archives-btn');
  const modal = document.getElementById('decrypted-modal');
  const closeBtn = document.querySelector('.close-btn');

  let currentUserId = userSelect.value;

  // Initialize the page for the selected user
  async function initUser() {
    currentUserId = userSelect.value;
    console.log(`Initializing for user: ${currentUserId}`);
    
    // Check if we have keys in localStorage for this user
    const hasKeys = await checkLocalKeys(currentUserId);
    
    if (hasKeys) {
      keyStatus.className = 'status-message success';
      keyStatus.innerHTML = '<i class="ti ti-check-circle"></i> Encryption keys are active for this device.';
      generateKeysBtn.style.display = 'none';
      archivesLayout.style.display = 'grid';
      
      await loadOtherUsersPublicKeys();
      await fetchMyArchives();
    } else {
      keyStatus.className = 'status-message info';
      keyStatus.innerHTML = '<i class="ti ti-circle-info"></i> No encryption keys found for this user on this device. Generate them to start using private archives.';
      generateKeysBtn.style.display = 'inline-block';
      archivesLayout.style.display = 'none';
    }
  }

  userSelect.addEventListener('change', initUser);

  // Check if private and public keys exist in localStorage
  async function checkLocalKeys(userId) {
    const privKeyJwk = localStorage.getItem(`privKey_${userId}`);
    const pubKeyJwk = localStorage.getItem(`pubKey_${userId}`);
    return !!(privKeyJwk && pubKeyJwk);
  }

  // Generate and register new RSA keys
  generateKeysBtn.addEventListener('click', async () => {
    try {
      generateKeysBtn.disabled = true;
      generateKeysBtn.innerHTML = '<i class="ti ti-spinner ti-spin"></i> Generating...';
      
      // 1. Generate Key Pair
      const keyPair = await window.CryptoUtils.generateRSAKeyPair();
      
      // 2. Export keys
      const pubKeyJwk = await window.CryptoUtils.exportKey(keyPair.publicKey);
      const privKeyJwk = await window.CryptoUtils.exportKey(keyPair.privateKey);
      
      // 3. Save to localStorage (Note: In production, private keys should be protected by a passphrase)
      localStorage.setItem(`pubKey_${currentUserId}`, JSON.stringify(pubKeyJwk));
      localStorage.setItem(`privKey_${currentUserId}`, JSON.stringify(privKeyJwk));
      
      // 4. Register Public Key with Backend
      const response = await fetch('/api/archives/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          publicKey: pubKeyJwk
        })
      });

      if (!response.ok) throw new Error('Failed to register public key on server');

      // Success
      initUser();
    } catch (error) {
      console.error(error);
      keyStatus.className = 'status-message error';
      keyStatus.innerHTML = `<i class="ti ti-triangle-exclamation"></i> Error generating keys: ${error.message}`;
      generateKeysBtn.disabled = false;
      generateKeysBtn.innerHTML = '<i class="ti ti-shield-halved"></i> Generate & Register Keys';
    }
  });

  // Load other users' public keys for sharing
  async function loadOtherUsersPublicKeys() {
    try {
      const response = await fetch('/api/archives/keys');
      const keys = await response.json();
      
      shareWithSelect.innerHTML = '';
      let added = 0;
      
      keys.forEach(keyData => {
        if (keyData.userId !== currentUserId) { // Don't add self to share list
          const option = document.createElement('option');
          option.value = keyData.userId;
          option.textContent = `User: ${keyData.userId}`;
          // Store the public key JWK as a data attribute
          option.dataset.pubkey = JSON.stringify(keyData.publicKey);
          shareWithSelect.appendChild(option);
          added++;
        }
      });
      
      if (added === 0) {
        const option = document.createElement('option');
        option.textContent = 'No other users have registered keys';
        option.disabled = true;
        shareWithSelect.appendChild(option);
      }
    } catch (error) {
      console.error('Error fetching public keys:', error);
    }
  }

  // Create a new encrypted archive
  createArchiveForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('archive-title').value;
    const content = document.getElementById('archive-content').value;
    const submitBtn = document.getElementById('submit-archive-btn');
    
    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="ti ti-spinner ti-spin"></i> Encrypting...';
      
      // 1. Generate a single AES key for this archive
      const aesKey = await window.CryptoUtils.generateAESKey();
      
      // 2. Encrypt the content with the AES key
      const { ciphertext, iv } = await window.CryptoUtils.encryptContent(content, aesKey);
      
      // 3. Get my own public key to encrypt the AES key for myself
      const myPubKeyJwk = JSON.parse(localStorage.getItem(`pubKey_${currentUserId}`));
      const myPubKey = await window.CryptoUtils.importKey(myPubKeyJwk, 'public');
      
      const encryptedKeys = {};
      
      // Encrypt AES key for owner
      encryptedKeys[currentUserId] = await window.CryptoUtils.encryptAESKeyWithRSA(aesKey, myPubKey);
      
      // 4. Encrypt AES key for each selected recipient
      const selectedOptions = Array.from(shareWithSelect.selectedOptions);
      for (const option of selectedOptions) {
        if (!option.disabled) {
          const recipientUserId = option.value;
          const recipientPubKeyJwk = JSON.parse(option.dataset.pubkey);
          const recipientPubKey = await window.CryptoUtils.importKey(recipientPubKeyJwk, 'public');
          
          encryptedKeys[recipientUserId] = await window.CryptoUtils.encryptAESKeyWithRSA(aesKey, recipientPubKey);
        }
      }
      
      // 5. Send to backend
      const response = await fetch('/api/archives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          ownerId: currentUserId,
          encryptedContent: ciphertext,
          iv: iv,
          encryptedKeys: encryptedKeys
        })
      });
      
      if (!response.ok) throw new Error('Failed to save archive to server');
      
      // Success
      createStatus.className = 'status-message success';
      createStatus.innerHTML = '<i class="ti ti-check"></i> Archive securely encrypted and saved!';
      createArchiveForm.reset();
      
      // Refresh list
      fetchMyArchives();
      
      setTimeout(() => {
        createStatus.style.display = 'none';
      }, 3000);
      
    } catch (error) {
      console.error(error);
      createStatus.className = 'status-message error';
      createStatus.innerHTML = `<i class="ti ti-triangle-exclamation"></i> Error: ${error.message}`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="ti ti-vault"></i> Encrypt & Save Archive';
    }
  });

  // Fetch archives accessible to the user
  async function fetchMyArchives() {
    try {
      archivesList.innerHTML = '<p class="empty-state"><i class="ti ti-spinner ti-spin"></i> Loading secure archives...</p>';
      
      const response = await fetch(`/api/archives?userId=${currentUserId}`);
      const archives = await response.json();
      
      archivesList.innerHTML = '';
      
      if (archives.length === 0) {
        archivesList.innerHTML = '<p class="empty-state">No accessible archives found.</p>';
        return;
      }
      
      archives.forEach(archive => {
        const item = document.createElement('div');
        item.className = 'archive-item';
        
        const dateStr = new Date(archive.timestamp).toLocaleDateString();
        
        item.innerHTML = `
          <div class="archive-info">
            <h3><i class="fa-solid ${archive.ownerId === currentUserId ? 'fa-user-lock' : 'fa-users'}"></i> ${archive.title}</h3>
            <div class="archive-meta">
              <span>Owner: ${archive.ownerId}</span>
              <span>Date: ${dateStr}</span>
            </div>
          </div>
          <button class="decrypt-btn" data-id="${archive.id}">
            <i class="ti ti-key"></i> Decrypt & View
          </button>
        `;
        
        // Add decrypt event listener
        const decryptBtn = item.querySelector('.decrypt-btn');
        decryptBtn.addEventListener('click', () => handleDecryptArchive(archive));
        
        archivesList.appendChild(item);
      });
      
    } catch (error) {
      console.error(error);
      archivesList.innerHTML = '<p class="empty-state" style="color:red;">Error loading archives.</p>';
    }
  }
  
  refreshArchivesBtn.addEventListener('click', fetchMyArchives);

  // Handle Decryption of an Archive
  async function handleDecryptArchive(archive) {
    try {
      // 1. Get user's private key from local storage
      const privKeyJwkStr = localStorage.getItem(`privKey_${currentUserId}`);
      if (!privKeyJwkStr) throw new Error('Private key not found on this device');
      
      const privKeyJwk = JSON.parse(privKeyJwkStr);
      const privKey = await window.CryptoUtils.importKey(privKeyJwk, 'private');
      
      // 2. Decrypt the AES key using the RSA private key
      const encryptedAesKeyBase64 = archive.encryptedKey;
      const aesKey = await window.CryptoUtils.decryptAESKeyWithRSA(encryptedAesKeyBase64, privKey);
      
      // 3. Decrypt the content using the AES key and IV
      const plaintext = await window.CryptoUtils.decryptContent(archive.encryptedContent, archive.iv, aesKey);
      
      // 4. Show in modal
      document.getElementById('modal-title').textContent = archive.title;
      document.getElementById('modal-content-body').textContent = plaintext;
      modal.style.display = 'block';
      
    } catch (error) {
      console.error("Decryption failed:", error);
      alert(`Decryption failed: ${error.message}\nMake sure you are using the device where your keys were generated.`);
    }
  }

  // Modal close handlers
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    document.getElementById('modal-content-body').textContent = ''; // clear for security
  });
  
  window.addEventListener('click', (event) => {
    if (event.target == modal) {
      modal.style.display = 'none';
      document.getElementById('modal-content-body').textContent = '';
    }
  });

  // Init on load
  initUser();
});
