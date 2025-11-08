// Encrypt Function
function aesEncryption() {
    const plaintext = document.getElementById("aesPlaintext").value;
    const key = document.getElementById("aesKey").value;

    // Validate key length (16, 24, or 32 characters)
    if (![16, 24, 32].includes(key.length)) {
        alert("Key must be 16, 24, or 32 characters long.");
        return;
    }

    // Encrypt the plaintext using AES
    const encrypted = CryptoJS.AES.encrypt(plaintext, key).toString();
    document.getElementById("aesCiphertext").value = encrypted;
    document.getElementById("aesDecryptCiphertext").value = encrypted;
    document.getElementById("aesDecryptKey").value= key;
}

// Decrypt Function
function aesDecryption() {
    const ciphertext = document.getElementById("aesDecryptCiphertext").value;
    const key = document.getElementById("aesDecryptKey").value;

    // Validate key length (16, 24, or 32 characters)
    if (![16, 24, 32].includes(key.length)) {
        alert("Key must be 16, 24, or 32 characters long.");
        return;
    }

    // Decrypt the ciphertext using AES
    const decrypted = CryptoJS.AES.decrypt(ciphertext, key);
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

    // Display the decrypted text
    document.getElementById("aesDecryptedText").value = decryptedText;
}

// Attach event listeners
document.getElementById("aesEncryptBtn").addEventListener("click", aesEncryption);
document.getElementById("aesDecryptBtn").addEventListener("click", aesDecryption);