class EncryptionService {
  private static instance: EncryptionService;
  private encryptionKey: CryptoKey | null = null;
  private initialized = false;

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // In a real app, this key would be securely stored and retrieved
      // For demo purposes, we'll generate a new key each time
      const keyMaterial = await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt', 'decrypt']
      );
      
      this.encryptionKey = keyMaterial;
      this.initialized = true;
    } catch (error) {
      console.error('Encryption initialization error:', error);
      throw new Error('Failed to initialize encryption service');
    }
  }

  async encrypt(data: string): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Generate a random initialization vector
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      // Convert data to ArrayBuffer
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      // Encrypt the data
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv
        },
        this.encryptionKey!,
        dataBuffer
      );
      
      // Combine IV and encrypted data
      const result = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      result.set(iv, 0);
      result.set(new Uint8Array(encryptedBuffer), iv.length);
      
      // Convert to base64 string
      return btoa(String.fromCharCode(...result));
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  async decrypt(encryptedData: string): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Convert from base64 string
      const encryptedBytes = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      
      // Extract IV and encrypted data
      const iv = encryptedBytes.slice(0, 12);
      const data = encryptedBytes.slice(12);
      
      // Decrypt the data
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv
        },
        this.encryptionKey!,
        data
      );
      
      // Convert ArrayBuffer to string
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Hash a value (e.g., for password verification)
  async hash(value: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(value);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Hashing error:', error);
      throw new Error('Failed to hash data');
    }
  }
}

export const encryptionService = EncryptionService.getInstance();