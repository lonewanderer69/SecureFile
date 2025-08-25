document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const passwordInput = document.getElementById('password');
    const suggestPasswordBtn = document.getElementById('suggest-password');
    const strengthMeter = document.getElementById('strength-meter');
    const strengthText = document.getElementById('strength-text');
    const strengthFeedback = document.getElementById('strength-feedback');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    const dropZone = document.getElementById('drop-zone');
    const decryptDropZone = document.getElementById('decrypt-drop-zone');
    const fileUpload = document.getElementById('file-upload');
    const decryptFileUpload = document.getElementById('decrypt-file-upload');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    // File Preview Elements
    const filePreview = document.getElementById('file-preview');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    const fileIcon = document.getElementById('file-icon');
    const removeFileBtn = document.getElementById('remove-file');
    
    const decryptFilePreview = document.getElementById('decrypt-file-preview');
    const decryptFileName = document.getElementById('decrypt-file-name');
    const decryptFileSize = document.getElementById('decrypt-file-size');
    const decryptFileIcon = document.getElementById('decrypt-file-icon');
    const removeDecryptFileBtn = document.getElementById('remove-decrypt-file');

    // Store selected files
    let selectedFile = null;
    let selectedDecryptFile = null;

    // Show file preview for encrypt tab
    function showFilePreview(file) {
        if (!file) return;
        selectedFile = file;
        fileName.textContent = file.name;
        fileSize.textContent = (file.size / 1024).toFixed(2) + ' KB';
        filePreview.classList.remove('hidden');
    }

    function updateStrengthMeter(strength) {
    switch (strength) {
        case 'weak':
            strengthMeter.style.width = '33.333%';
            strengthMeter.style.backgroundColor = '#EF4444'; // red
            break;
        case 'medium':
            strengthMeter.style.width = '66.666%';
            strengthMeter.style.backgroundColor = '#F59E0B'; // yellow
            break;
        case 'strong':
            strengthMeter.style.width = '100%';
            strengthMeter.style.backgroundColor = '#10B981'; // green
            break;
        default: // 'none' or undefined
            strengthMeter.style.width = '0%';
            strengthMeter.style.backgroundColor = '#E5E7EB'; // gray
    }
}
    // Clear file preview for encrypt tab
    function clearFilePreview() {
        selectedFile = null;
        fileName.textContent = '';
        fileSize.textContent = '';
        filePreview.classList.add('hidden');
        fileUpload.value = '';
    }

    // Show file preview for decrypt tab
    function showDecryptFilePreview(file) {
        if (!file) return;
        selectedDecryptFile = file;
        decryptFileName.textContent = file.name;
        decryptFileSize.textContent = (file.size / 1024).toFixed(2) + ' KB';
        decryptFilePreview.classList.remove('hidden');
    }

    // Clear file preview for decrypt tab
    function clearDecryptFilePreview() {
        selectedDecryptFile = null;
        decryptFileName.textContent = '';
        decryptFileSize.textContent = '';
        decryptFilePreview.classList.add('hidden');
        decryptFileUpload.value = '';
    }

    // Remove file preview event listeners
    removeFileBtn.addEventListener('click', clearFilePreview);
    removeDecryptFileBtn.addEventListener('click', clearDecryptFilePreview);

    // Update handleFileSelect to show preview
    function handleFileSelect(file, isDecrypt) {
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            showToast('File size exceeds 100MB limit', 'error');
            return;
        }

        const actionText = isDecrypt ? 'decrypt' : 'encrypt';
        showToast(`File selected for ${actionText}ion: ${file.name}`, 'success');

        if (isDecrypt) {
            showDecryptFilePreview(file);
        } else {
            showFilePreview(file);
        }
    }

    // Theme Management
    function initTheme() {
        // Check for saved theme preference or default to light mode
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
            themeIcon.className = 'fas fa-sun text-lg';
        } else {
            document.documentElement.classList.remove('dark');
            themeIcon.className = 'fas fa-moon text-lg';
        }
    }

    function toggleTheme() {
        const isDark = document.documentElement.classList.contains('dark');
        
        if (isDark) {
            document.documentElement.classList.remove('dark');
            themeIcon.className = 'fas fa-moon text-lg';
            localStorage.setItem('theme', 'light');
            showToast('Switched to light theme', 'info');
        } else {
            document.documentElement.classList.add('dark');
            themeIcon.className = 'fas fa-sun text-lg';
            localStorage.setItem('theme', 'dark');
            showToast('Switched to dark theme', 'info');
        }
    }

    // Initialize theme on page load
    initTheme();

    // Theme toggle event listener
    themeToggle.addEventListener('click', toggleTheme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.documentElement.classList.add('dark');
                themeIcon.className = 'fas fa-sun text-lg';
            } else {
                document.documentElement.classList.remove('dark');
                themeIcon.className = 'fas fa-moon text-lg';
            }
        }
    });

    // Tab Switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(`${button.dataset.tab}-section`).classList.add('active');
        });
    });

    passwordInput.addEventListener('input', async function(e) {
    const password = e.target.value;
    
    // Reset strength indicator when password is empty
    if (!password) {
        updateStrengthMeter('none');
        strengthText.textContent = 'None';
        strengthFeedback.textContent = '';
        return;
    }

    // Evaluate password strength
    const result = await passwordAI.evaluatePassword(password);
    
    // Update UI
    strengthText.textContent = result.strength.charAt(0).toUpperCase() + result.strength.slice(1);
    strengthFeedback.textContent = result.feedback.join('. ');
    updateStrengthMeter(result.strength);
});
// Suggest Password Button
suggestPasswordBtn.addEventListener('click', async () => {
    await handleGeneratedSecret(passwordAI.generatePassword(), 'password');
});

// Suggest Passphrase Button
document.getElementById('suggest-passphrase').addEventListener('click', async () => {
    await handleGeneratedSecret(passwordAI.generatePassphrase(), 'passphrase');
});

// Shared handler for passwords/passphrases
async function handleGeneratedSecret(secret, type = 'password') {
    // Show the generated secret
    passwordInput.value = secret;
    passwordInput.type = 'text';
    
    // Evaluate strength
    const result = await passwordAI.evaluatePassword(secret);
    
    // Update UI
    strengthText.textContent = result.strength.charAt(0).toUpperCase() + result.strength.slice(1);
    strengthFeedback.textContent = result.feedback.join('. ');
    updateStrengthMeter(result.strength);
    
    // Show success message
    showToast(`Strong ${type} generated!`, 'success');
    
    // Hide password after 3 seconds (only for passwords)
        setTimeout(() => {
            passwordInput.type = 'password';
        }, 3000);
    
    // Copy animation and clipboard handling
    const btn = type === 'password' ? suggestPasswordBtn : document.getElementById('suggest-passphrase');
    const originalContent = btn.innerHTML;
    
    try {
        await navigator.clipboard.writeText(secret);
        btn.innerHTML = '<i class="fas fa-check text-lg"></i><span class="ml-1 text-sm">Copied!</span>';
        setTimeout(() => {
            btn.innerHTML = originalContent;
        }, 2000);
    } catch (err) {
        console.warn('Copy failed:', err);
        showToast('Failed to copy to clipboard', 'error');
        btn.innerHTML = originalContent;
    }
}

    // File Drop Zone Handling
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add('drop-active');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('drop-active');
    }

    function handleDrop(e, isDecrypt = false) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('drop-active');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const fileInput = isDecrypt ? decryptFileUpload : fileUpload;
            fileInput.files = files;
            handleFileSelect(files[0], isDecrypt);
        }
    }

    // Add drag and drop event listeners
    [dropZone, decryptDropZone].forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragleave', handleDragLeave);
    });

    dropZone.addEventListener('drop', (e) => handleDrop(e, false));
    decryptDropZone.addEventListener('drop', (e) => handleDrop(e, true));

    // File input change handlers
    fileUpload.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0], false);
        }
    });

    decryptFileUpload.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0], true);
        }
    });

    function handleFileSelect(file, isDecrypt) {
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            showToast('File size exceeds 100MB limit', 'error');
            return;
        }

        const actionText = isDecrypt ? 'decrypt' : 'encrypt';
        showToast(`File selected for ${actionText}ion: ${file.name}`, 'success');
    }

    function showToast(message, type = 'info') {
        toastMessage.textContent = message;
        
        // Update icon based on type
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
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
});