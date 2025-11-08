function caesarEncrypt(text, shift) {
    return text.split('')
        .map(char => {
            if (/[a-zA-Z]/.test(char)) {
                const base = char.charCodeAt(0) < 91 ? 65 : 97; 
                return String.fromCharCode((char.charCodeAt(0) - base + shift) % 26 + base);
            }
            return char; 
        })
        .join('');
}

function caesarDecrypt(text, shift) {
    return caesarEncrypt(text, -shift); 
}

document.getElementById('encryptBtn').addEventListener('click', (event) => {
    event.preventDefault();
    const text = document.getElementById('caesarText').value;
    const shift = parseInt(document.getElementById('shiftValue').value, 10);

    if (text && !isNaN(shift)) {
        const encryptedText = caesarEncrypt(text, shift);
        document.getElementById('caesarResult').textContent = `Encrypted: ${encryptedText}`;
        document.getElementById('decryptBtn').style.display = 'inline-block'; 
        document.getElementById('decryptedResult').textContent = ''; 
        document.getElementById('caesarText').value = encryptedText; 
    } else {
        alert("Please enter valid text and shift value.");
    }
});
document.getElementById('decryptBtn').addEventListener('click', (event) => {
    event.preventDefault();
    const encryptedText = document.getElementById('caesarText').value;
    const shift = parseInt(document.getElementById('shiftValue').value, 10);

    if (encryptedText && !isNaN(shift)) {
        const decryptedText = caesarDecrypt(encryptedText, shift);
        document.getElementById('decryptedResult').textContent = `Decrypted: ${decryptedText}`;
    } else {
        alert("Please enter valid encrypted text and shift value.");
    }
});
