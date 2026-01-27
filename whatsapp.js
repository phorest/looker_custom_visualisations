(function() {
    // 1. Read Config
    const config = window.myAppConfig || { phoneNumber: "", welcomeMessage: "Hello!" };
    
    // 2. Create the container
    const container = document.createElement('div');
    container.id = 'my-whatsapp-widget';
    document.body.appendChild(container);

    // 3. Create Shadow DOM (Style Isolation)
    const shadow = container.attachShadow({ mode: 'open' });

    // 4. Define Styles
    const style = document.createElement('style');
    style.textContent = `
        .widget-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #25D366;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .widget-popup {
            display: none; /* Hidden by default */
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 300px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            z-index: 9999;
            font-family: sans-serif;
        }
        .popup-header { background: #075E54; color: white; padding: 15px; border-radius: 10px 10px 0 0; }
        .popup-body { padding: 20px; color: #333; }
        .popup-footer { padding: 10px; text-align: center; }
        .start-chat-btn {
            background: #25D366; color: white; border: none; padding: 10px 20px;
            border-radius: 20px; cursor: pointer; font-weight: bold; text-decoration: none;
        }
    `;
    shadow.appendChild(style);

    // 5. Build HTML Elements
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div class="widget-popup" id="popup">
            <div class="popup-header">WhatsApp Support</div>
            <div class="popup-body">
                <p>${config.welcomeMessage}</p>
            </div>
            <div class="popup-footer">
                <a href="https://wa.me/${config.phoneNumber}" target="_blank" class="start-chat-btn">
                    Start Chat
                </a>
            </div>
        </div>
        <div class="widget-button" id="btn">
            <svg width="35" height="35" viewBox="0 0 24 24" fill="white">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654z"/>
            </svg>
        </div>
    `;
    shadow.appendChild(wrapper);

    // 6. Add Event Listeners
    const btn = shadow.getElementById('btn');
    const popup = shadow.getElementById('popup');

    btn.addEventListener('click', () => {
        popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
    });
})();