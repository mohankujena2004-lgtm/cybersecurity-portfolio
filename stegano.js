function toBinary(text) {
    return text
        .split('')
        .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
        .join('')
        .split('')
        .map(Number);
}

function fromBinary(binaryArray) {
    const binaryString = binaryArray.join('');
    const text = binaryString.match(/.{1,8}/g)
        .map(byte => String.fromCharCode(parseInt(byte, 2)))
        .join('');
    return text;
}

function embedTextLength(length, pixels) {
    const binaryLength = length.toString(2).padStart(32, '0');
    for (let i = 0; i < 32; i++) {
        pixels[i] = (pixels[i] & ~1) | Number(binaryLength[i]);
    }
}

function extractTextLength(pixels) {
    let binaryLength = '';
    for (let i = 0; i < 32; i++) {
        binaryLength += (pixels[i] & 1).toString();
    }
    return parseInt(binaryLength, 2);
}

document.getElementById('hideTextBtn').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput').files[0];
    const textToHide = document.getElementById('textToHide').value;

    if (!fileInput || !textToHide) {
        alert('Please upload an image and enter the text to hide.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.getElementById('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;

            const binaryText = toBinary(textToHide);
            const textLength = binaryText.length;

            if (textLength + 32 > pixels.length / 4) { // Check if text fits in the image
                alert('Text is too long to hide in this image.');
                return;
            }

            embedTextLength(textLength, pixels);

            let textIndex = 0;
            for (let i = 32; i < pixels.length && textIndex < binaryText.length; i += 4) {
                pixels[i] = (pixels[i] & ~1) | binaryText[textIndex++];
            }

            ctx.putImageData(imageData, 0, 0);
            document.getElementById('downloadBtn').style.display = 'block';
        };

        img.onerror = function () {
            alert('Failed to load image. Please try another image file.');
        };

        img.src = event.target.result;
    };

    reader.onerror = function () {
        alert('Error reading file. Please try again.');
    };

    reader.readAsDataURL(fileInput);
});

document.getElementById('downloadBtn').addEventListener('click', () => {
    const canvas = document.getElementById('canvas');
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'stego_image.png';
    link.click();
});

document.getElementById('extractTextBtn').addEventListener('click', () => {
    const fileInput = document.getElementById('extractFileInput').files[0];

    if (!fileInput) {
        alert('Please upload an image to extract hidden text.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.getElementById('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;

            const textLength = extractTextLength(pixels);

            if (textLength > pixels.length / 4 - 32) { // Ensure length is within bounds
                alert('Error extracting text: Data length is too large for this image.');
                return;
            }

            let binaryArray = [];
            for (let i = 32, j = 0; i < pixels.length && j < textLength; i += 4, j++) {
                binaryArray.push(pixels[i] & 1);
            }

            const hiddenText = fromBinary(binaryArray);
            document.getElementById('extractedText').value = hiddenText || 'No hidden text found';
        };

        img.onerror = function () {
            alert('Failed to load image. Please try another image file.');
        };

        img.src = event.target.result;
    };

    reader.onerror = function () {
        alert('Error reading file. Please try again.');
    };

    reader.readAsDataURL(fileInput);
});
