class FileDecryption {
    constructor() {
        this.decryptButton = document.getElementById('decrypt-btn');
        this.fileInput = document.getElementById('decrypt-file-upload');
        this.passwordInput = document.getElementById('decrypt-password');
        this.init();
    }

    init() {
        this.decryptButton.addEventListener('click', () => this.handleDecryption());
    }

    async handleDecryption() {
        try {
            // Validate inputs
            if (!this.fileInput.files.length) {
                this.showToast('Please select a file to decrypt', 'error');
                return;
            }

            const file = this.fileInput.files[0];
            const password = this.passwordInput.value;

            if (!password) {
                this.showToast('Please enter the decryption password', 'error');
                return;
            }

            // Show decryption progress
            this.decryptButton.disabled = true;
            this.decryptButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Decrypting...';

            // Read the encrypted file
            const fileContent = await this.readFile(file);
            
            // Extract salt (16 bytes), IV (12 bytes), and metadata (128 bytes)
            const salt = fileContent.slice(0, 16);
            const iv = fileContent.slice(16, 28);
            const metaData = fileContent.slice(28, 156);
            const encryptedData = fileContent.slice(156);
            
            // Extract original filename from metadata
            const filenameLength = new DataView(metaData.buffer).getUint16(0);
            let originalFileName = new TextDecoder().decode(
                metaData.slice(2, 2 + filenameLength)
            ).replace(/\0+$/, '').trim(); // Trim null bytes and whitespace

            // Fallback if filename is corrupted
            if (!originalFileName || originalFileName.includes('\0')) {
                originalFileName = file.name.replace(/\.encrypted$/, '') || `decrypted_${Date.now()}`;
            }

            // Derive key from password
            const key = await this.deriveKey(password, salt);
            
            try {
                // Decrypt the file content
                const decryptedContent = await this.decrypt(encryptedData, key, iv);
                this.downloadFile(decryptedContent, originalFileName);
                this.showToast('File decrypted successfully!', 'success');
            } catch (error) {
                this.showToast('Incorrect password or corrupted file', 'error');
                console.error('Decryption failed:', error);
            }
        } catch (error) {
            console.error('Decryption error:', error);
            this.showToast('Error decrypting file: ' + error.message, 'error');
        } finally {
            // Reset button state
            this.decryptButton.disabled = false;
            this.decryptButton.innerHTML = 'Decrypt File';
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
            ['decrypt']
        );
    }

    async decrypt(encryptedData, key, iv) {
        return await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            encryptedData
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

const fileDecryption = new FileDecryption();