package com.example.notes.config;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Component;

@Component
public class XssSanitizer {

    private final Safelist safelist;

    public XssSanitizer() {
        // Safe list allowing safe formatting while stripping dangerous scripts, event handlers, and iframes
        this.safelist = Safelist.basic()
                .addTags("h1", "h2", "h3", "h4", "h5", "h6", "pre", "code", "hr", "span")
                .addAttributes(":all", "class", "style");
    }

    /**
     * Sanitizes raw text / HTML to prevent cross-site scripting (XSS).
     * @param dirtyText Untrusted user input
     * @return Sanitized safe text
     */
    public String sanitize(String dirtyText) {
        if (dirtyText == null) {
            return null;
        }
        return Jsoup.clean(dirtyText, safelist);
    }
}

