class PasswordAI {
    constructor() {
        this.commonPatterns = [
            /^[a-z]+$/i,
            /^[0-9]+$/,
            /^[a-z0-9]+$/i,
            /(.)\1{2,}/,
            /(123|234|345|456|567|789)/
        ];
        
        this.commonWords = [
            'password', 'admin', '123456', 'welcome', 'qwerty',
            'monkey', 'dragon', 'letmein', 'football', 'iloveyou'
        ];

        this.specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        this.numbers = '0123456789';
        this.lowercase = 'abcdefghijklmnopqrstuvwxyz';
        this.uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        // Passphrase components
        this.wordBanks = {
            adjectives: ['secure', 'hidden', 'random', 'epic', 'magic'],
            nouns: ['dragon', 'phoenix', 'ocean', 'forest', 'castle'],
            verbs: ['protect', 'defend', 'create', 'discover'],
            adverbs: ['swiftly', 'boldly', 'wisely']
        };

        this.minEntropyForStrong = 80;
        this.minEntropyForMedium = 40;
    }

    // ======= PASSWORD GENERATION =======
    generatePassword(length = 16) {
        let password = '';
        password += this.getRandomChar(this.uppercase);
        password += this.getRandomChar(this.lowercase);
        password += this.getRandomChar(this.numbers);
        password += this.getRandomChar(this.specialChars);

        const allChars = this.uppercase + this.lowercase + this.numbers + this.specialChars;
        for (let i = password.length; i < length; i++) {
            password += this.getRandomChar(allChars);
        }
        return this.shuffleString(password);
    }

    // ======= PASSPHRASE GENERATION =======
    generatePassphrase() {
        const random = arr => arr[this.getRandomIndex(arr.length)];
        const components = [
            random(this.wordBanks.adjectives),
            random(this.wordBanks.nouns),
            random(this.wordBanks.verbs),
            Math.floor(this.getRandomNumber(10, 99)),
            Math.random() > 0.5 ? this.getRandomChar(this.specialChars) : null
        ].filter(Boolean);
        
        return components.join('-');
    }

    // ======= EVALUATION METHODS =======
    async evaluatePassword(password) {
        if (!password) return { strength: 'none', feedback: ['Enter a password'] };
        
        const entropy = this.calculateEntropy(password);
        const isBreached = await this.isPasswordBreached(password);
        let strength, feedback = [];

        // Common checks
        if (password.length < 8) feedback.push('Too short (min 8 chars)');
        if (this.commonPatterns.some(p => p.test(password))) feedback.push('Avoid common patterns');
        if (this.commonWords.some(w => password.toLowerCase().includes(w))) feedback.push('Avoid common words');

        // Entropy rating
        if (entropy < this.minEntropyForMedium) {
            strength = 'weak';
            feedback.push('Add more character variety');
        } else if (entropy < this.minEntropyForStrong) {
            strength = 'medium';
        } else {
            strength = 'strong';
        }

        if (isBreached) {
            strength = 'weak';
            feedback.push('Password appeared in breaches!');
        }

        return { 
            strength, 
            feedback: feedback.length ? feedback : ['Strong password!'] 
        };
    }

    // Alias for passphrases (reuses password evaluation)
    async evaluatePassphrase(passphrase) {
        return this.evaluatePassword(passphrase);
    }

    // ======= CORE UTILITIES =======
    calculateEntropy(str) {
        let charsetSize = 0;
        if (/[a-z]/.test(str)) charsetSize += 26;
        if (/[A-Z]/.test(str)) charsetSize += 26;
        if (/[0-9]/.test(str)) charsetSize += 10;
        if (/[^A-Za-z0-9]/.test(str)) charsetSize += this.specialChars.length;
        return Math.log2(charsetSize) * str.length;
    }

    async isPasswordBreached(password) {
        try {
            const hash = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(password));
            const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
            const response = await fetch(`https://api.pwnedpasswords.com/range/${hashHex.slice(0, 5)}`);
            return (await response.text()).includes(hashHex.slice(5).toUpperCase());
        } catch {
            return false;
        }
    }

    getRandomChar(str) {
        return str[this.getRandomIndex(str.length)];
    }

    getRandomIndex(max) {
        const buf = new Uint32Array(1);
        crypto.getRandomValues(buf);
        return buf[0] % max;
    }

    getRandomNumber(min, max) {
        return min + this.getRandomIndex(max - min + 1);
    }

    shuffleString(str) {
        const arr = str.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = this.getRandomIndex(i + 1);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('');
    }
}

window.passwordAI = new PasswordAI();