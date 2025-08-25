class FileEncryption {
    constructor() {
        this.encryptButton = document.getElementById('encrypt-btn');
        this.fileInput = document.getElementById('file-upload');
        this.passwordInput = document.getElementById('password');
        this.init();
    }

    init() {
        this.encryptButton.addEventListener('click', () => this.handleEncryption());
    }

    async handleEncryption() {
        try {
            // Validate inputs
            if (!this.fileInput.files.length) {
                this.showToast('Please select a file to encrypt', 'error');
                return;
            }

            const file = this.fileInput.files[0];
            const password = this.passwordInput.value;

            if (!password) {
                this.showToast('Please enter an encryption password', 'error');
                return;
            }

            // Check password strength
            const strengthResult = passwordAI.evaluatePassword(password);
            if (strengthResult.strength === 'weak') {
                if (!confirm('The password is weak. This may compromise security. Do you want to continue?')) {
                    return;
                }
            }

            // Show encryption progress
            this.encryptButton.disabled = true;
            this.encryptButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Encrypting...';

            // Read the file
            const fileContent = await this.readFile(file);
            
            // Generate a random salt and IV
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(12));
            
            // Derive key from password
            const key = await this.deriveKey(password, salt);
            
            // Encrypt the file content
            const encryptedContent = await this.encrypt(fileContent, key, iv);
            
            // Pack metadata (filename length + filename)
            const encoder = new TextEncoder();
            const filenameData = encoder.encode(file.name);
            const metaData = new Uint8Array(128);
            new DataView(metaData.buffer).setUint16(0, filenameData.length); // Store length
            metaData.set(filenameData, 2); // Store filename
            
            // Combine salt, IV, metadata, and encrypted content
            const finalContent = new Uint8Array([
                ...salt,
                ...iv,
                ...metaData,
                ...new Uint8Array(encryptedContent)
            ]);
            
            // Create and download the encrypted file
            const encryptedFileName = `${file.name}.encrypted`;
            this.downloadFile(finalContent, encryptedFileName);
            
            this.showToast('File encrypted successfully!', 'success');
        } catch (error) {
            console.error('Encryption error:', error);
            this.showToast('Error encrypting file: ' + error.message, 'error');
        } finally {
            // Reset button state
            this.encryptButton.disabled = false;
            this.encryptButton.innerHTML = 'Encrypt File';
        }
    }

    async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(new Uint8Array(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(file);
        });
    }

    async deriveKey(password, salt) {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );
        
        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt']
        );
    }

    async encrypt(data, key, iv) {
        return await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            data
        );
    }

    downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showToast(message, type) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        const toastIcon = document.getElementById('toast-icon');
        
        toastMessage.textContent = message;
        
        toastIcon.className = 'fas';
        switch (type) {
            case 'success':
                toastIcon.classList.add('fa-check-circle', 'text-green-500');
                break;
            case 'error':
                toastIcon.classList.add('fa-exclamation-circle', 'text-red-500');
                break;
            default:
                toastIcon.classList.add('fa-info-circle', 'text-blue-500');
        }

        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

const fileEncryption = new FileEncryption();