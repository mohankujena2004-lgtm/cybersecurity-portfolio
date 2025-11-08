async function scanURL() {
    const urlInput = document.getElementById("urlInput");
    const result = document.getElementById("result");
    
    // Verify required elements are present
    if (!urlInput || !result) {
        console.error("Necessary HTML elements are missing.");
        return;
    }

    const url = urlInput.value.trim().toLowerCase();
    
    // Validate URL format
    if (!url || !url.startsWith("http")) {
        result.textContent = "Please enter a valid URL.";
        result.style.color = "orange";
        return;
    }

    // Define common phishing indicators
    const suspiciousWords = ["login", "verify", "secure", "update", "account"];
    const uncommonDomains = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".site", ".win"];
    const commonSites = ["facebook", "paypal", "instagram", "google"];
    const lookalikeDomains = ["faceb00k","f@cebook","f@ceb00k", "g00gle","g0ogle","p@ypal","p@yp@l" ,"paypa1", "1nstagram","inst@gram","instgr@m"];

    let status = false;
    let message = "";

    // Extract domain from URL
    const domain = new URL(url).hostname;

    // Check for suspicious words
    for (let i = 0; i < suspiciousWords.length; i++) {
        const word = suspiciousWords[i];
        let isCommonSite = false;
    
        // Check if the domain includes any common site
        for (let j = 0; j < commonSites.length; j++) {
            if (domain.includes(commonSites[j])) {
                isCommonSite = true;
                break;
            }
        }
    
        if (url.includes(word) && !isCommonSite) {
            status = true;
            message += `Contains suspicious word: "${word}". `;
        }
    }

    // Check for lookalike domains
    for (let i = 0; i < lookalikeDomains.length; i++) {
        if (domain.includes(lookalikeDomains[i])) {
            status = true;
            message += `Warning: Domain resembles popular site: "${lookalikeDomains[i]}". `;
            break;
        }
    }

    // Check for uncommon domain extensions
    for (let i = 0; i < uncommonDomains.length; i++) {
        const ext = uncommonDomains[i];
        if (domain.endsWith(ext)) {
            status = true;
            message += `Uses uncommon domain: "${domain.split('.').pop()}". `;
            break;  // Exit loop once a match is found
        }
    }
    
    // Check for excessive subdomains
    const domainParts = domain.split(".");
    if (domainParts.length > 3) {
        status = true;
        message += "Contains too many subdomains. ";
    }

    // Display result with appropriate color
    result.style.color = status ? "red" : "green";
    result.textContent = status ? `Potential phishing link! ${message}` : "URL appears safe.";
}
