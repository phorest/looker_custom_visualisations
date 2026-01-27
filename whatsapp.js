(function() {
    // 1. Read Config
    const config = window.myAppConfig || { 
        phoneNumber: "", 
        welcomeMessage: "Hello! I'm interested in your services.",
        position: "right" // default position
    };

    // Helper: Clean phone number
    function sanitizePhoneNumber(number) {
        let cleanNumber = number.replace(/\D/g, ''); 
        if (cleanNumber.startsWith('00')) cleanNumber = cleanNumber.substring(2);
        return cleanNumber;
    }

    // 2. Create the container
    const container = document.createElement('div');
    container.id = 'whatsapp-widget-container';
    document.body.appendChild(container);

    // 3. Create Shadow DOM (Style Isolation)
    const shadow = container.attachShadow({ mode: 'open' });

    // 4. Define Styles (Converted from the React code)
    const style = document.createElement('style');
    style.textContent = `
        .widget-button {
            position: fixed;
            bottom: 24px;
            ${config.position === 'left' ? 'left: 24px;' : 'right: 24px;'}
            background-color: #25D366;
            color: white;
            border-radius: 50px; /* Pill shape */
            padding: 12px 24px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-weight: 600;
            font-size: 16px;
            text-decoration: none;
            transition: all 0.2s ease;
            border: none;
            outline: none;
        }

        /* Hover Effects from your file */
        .widget-button:hover {
            opacity: 0.9;
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.2);
        }
        
        .widget-button:active {
            transform: translateY(0px);
        }

        /* SVG Icon Style */
        .whatsapp-icon {
            width: 24px;
            height: 24px;
            fill: currentColor;
            flex-shrink: 0;
        }
    `;
    shadow.appendChild(style);

    // 5. Logic to build the link
    const cleanPhone = sanitizePhoneNumber(config.phoneNumber);
    const encodedMessage = encodeURIComponent(config.welcomeMessage);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    // 6. Build HTML Elements (Direct Link Button)
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <a href="${whatsappUrl}" target="_blank" class="widget-button">
            <svg class="whatsapp-icon" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
            </svg>
            <span>Chat on WhatsApp</span>
        </a>
    `;
    shadow.appendChild(wrapper);

})();