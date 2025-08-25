# Project Skripsi

SecureFile(https://securefiles.my.id) is a client-side, browser-based file encryption and decryption tool. It uses modern cryptography to securely encrypt files locally without uploading them to any server.

## Features

- Encrypt and decrypt files securely in your browser.
- Client-side encryption using AES-256-GCM with PBKDF2 key derivation.
- AI-powered Password Assistant:
  - Suggests strong, random passwords.
  - Evaluates password strength in real-time.
  - Provides feedback and password requirements.
- Light/Dark Theme Toggle:
  - Switch between light and dark themes with a single click.
  - Remembers your theme preference in localStorage.
  - Automatically detects system theme preference.
  - Smooth transitions between themes.
- Drag & drop file upload support.
- Responsive and modern UI built with Tailwind CSS.
- No data leaves your browser, ensuring privacy and security.

## Usage

1. **Encrypt a File:**
   - Upload or drag & drop a file (up to 100MB).
   - Enter a strong encryption password or use the "Suggest" button to generate one.
   - View the password strength meter and feedback.
   - Click "Encrypt File" to download the encrypted file.

2. **Decrypt a File:**
   - Switch to the "Decrypt File" tab.
   - Upload the encrypted file.
   - Enter the decryption password.
   - Click "Decrypt File" to download the decrypted file.

3. **Theme Toggle:**
   - Click the moon/sun icon in the top-right corner to switch themes.
   - Your preference is automatically saved and restored on future visits.
   - The app respects your system's dark mode preference by default.

## Password Requirements

- Minimum 8 characters.
- At least one uppercase letter.
- At least one number.
- At least one special character.

## Security

- All encryption and decryption happen locally in your browser.
- Uses AES-GCM with 256-bit keys derived via PBKDF2 with 100,000 iterations.
- Passwords are never sent to any server.

## Development

- Built with vanilla JavaScript and Tailwind CSS.
- Password strength and suggestion powered by a custom AI module.
- Theme switching with localStorage persistence and system preference detection.
- Tested on modern browsers.

## Browser Compatibility

- Chrome/Chromium 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## License

MIT License

---

