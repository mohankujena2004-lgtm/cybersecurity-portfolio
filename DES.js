function encryption() {
    const plaintext = document.getElementById("desPlaintext").value;
    const key = document.getElementById("desKey").value;
    
    if (key.length !== 8) {
        alert("Key must be exactly 8 characters long.");
        return;
    }

    const encrypted = CryptoJS.DES.encrypt(plaintext, key).toString();
    document.getElementById("desCiphertext").value = encrypted;
    document.getElementById("desDecryptCiphertext").value= encrypted;
    document.getElementById("desDecryptKey").value= key;

}

function decryption() {
    const ciphertext = document.getElementById("desDecryptCiphertext").value;
    const key = document.getElementById("desDecryptKey").value;
    
    if (key.length !== 8) {
        alert("Key must be exactly 8 characters long.");
        return;
    }
    const decrypted = CryptoJS.DES.decrypt(ciphertext, key);
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    
    document.getElementById("desDecryptedText").value = decryptedText;
}

document.getElementById("desEncryptBtn").addEventListener("click", encryption);
document.getElementById("desDecryptBtn").addEventListener("click", decryption);