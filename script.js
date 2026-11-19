document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEYS = {
        LAST_ORDER: 'northStarLastOrder',
        FAVORITES: 'northStarFavorites',
        LAST_CUSTOMER: 'northStarLastCustomer'
    };

    const MENU_ITEMS = [
        {
            id: 'sourdough',
            name: 'Artisanal Sourdough',
            category: 'bread',
            icon: '&#129366;',
            description: 'Fermented for 36 hours with a crisp crust and a soft, airy crumb.',
            price: 6.50,
            prepMinutes: 45
        },
        {
            id: 'croissant',
            name: 'All-Butter Croissant',
            category: 'pastry',
            icon: '&#129360;',
            description: 'Flaky, golden layers made with authentic European butter.',
            price: 3.75,
            prepMinutes: 30
        },
        {
            id: 'tart',
            name: 'Wild Berry Tart',
            category: 'pastry',
            icon: '&#129744;',
            description: 'Fresh seasonal berries on a bed of rich vanilla custard cream.',
            price: 5.25,
            prepMinutes: 25
        }
    ];

    const state = {
        activeFilter: 'all',
        favorites: loadFavoritesFromStorage(),
        lastOrder: loadLastOrderFromStorage(),
        lastCustomer: loadLastCustomerFromStorage()
    };

    const menuGrid = document.getElementById('menuGrid');
    const favCountEl = document.getElementById('favCount');
    const filterButtons = document.querySelectorAll('.filter-btn');

    const itemSelect = document.getElementById('itemSelect');
    const quantityInput = document.getElementById('quantity');
    const qtyError = document.getElementById('qtyError');
    const calcBtn = document.getElementById('calcBtn');
    const calcResult = document.getElementById('calcResult');
    const resultText = document.getElementById('resultText');
    const savedOrderBanner = document.getElementById('savedOrderBanner');

    const contactForm = document.getElementById('contactForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const messageError = document.getElementById('messageError');
    const formFeedback = document.getElementById('formFeedback');

    function loadFavoritesFromStorage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
            console.error('Error loading favorites from localStorage:', err);
            return [];
        }
    }

    function saveFavoritesToStorage(favoritesList) {
        try {
            localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favoritesList));
        } catch (err) {
            console.error('Error saving favorites to localStorage:', err);
        }
    }

    function loadLastOrderFromStorage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.LAST_ORDER);
            return raw ? JSON.parse(raw) : null;
        } catch (err) {
            console.error('Error loading last order from localStorage:', err);
            return null;
        }
    }

    function saveLastOrderToStorage(orderData) {
        try {
            localStorage.setItem(STORAGE_KEYS.LAST_ORDER, JSON.stringify(orderData));
        } catch (err) {
            console.error('Error saving last order to localStorage:', err);
        }
    }

    function loadLastCustomerFromStorage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.LAST_CUSTOMER);
            return raw ? JSON.parse(raw) : null;
        } catch (err) {
            console.error('Error loading customer data from localStorage:', err);
            return null;
        }
    }

    function saveLastCustomerToStorage(customerData) {
        try {
            localStorage.setItem(STORAGE_KEYS.LAST_CUSTOMER, JSON.stringify(customerData));
        } catch (err) {
            console.error('Error saving customer data to localStorage:', err);
        }
    }

    function populateItemSelect() {
        itemSelect.innerHTML = '';
        MENU_ITEMS.forEach((item) => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `${item.name} (Prep time: ${item.prepMinutes} mins)`;
            itemSelect.appendChild(option);
        });
    }

    function updateFavoriteCount() {
        favCountEl.textContent = state.favorites.length;
    }

    function toggleFavorite(itemId) {
        const index = state.favorites.indexOf(itemId);
        if (index === -1) {
            state.favorites.push(itemId);
        } else {
            state.favorites.splice(index, 1);
        }
        saveFavoritesToStorage(state.favorites);
        updateFavoriteCount();
        renderMenu();
    }

    function getFilteredItems() {
        if (state.activeFilter === 'favorites') {
            return MENU_ITEMS.filter((item) => state.favorites.includes(item.id));
        }
        if (state.activeFilter === 'all') {
            return MENU_ITEMS;
        }
        return MENU_ITEMS.filter((item) => item.category === state.activeFilter);
    }

    function renderMenu() {
        const itemsToShow = getFilteredItems();
        menuGrid.innerHTML = '';

        if (itemsToShow.length === 0) {
            menuGrid.innerHTML = `
                <div class="empty-state">
                    <p>No items match this view yet. Click "Save Favorite" on any specialty to keep it here.</p>
                </div>
            `;
            return;
        }

        itemsToShow.forEach((item) => {
            const isFav = state.favorites.includes(item.id);
            const card = document.createElement('article');
            card.className = 'menu-card';
            card.innerHTML = `
                <div class="card-icon">${item.icon}</div>
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <span class="price">$${item.price.toFixed(2)}</span>
                <div class="card-actions">
                    <button type="button" class="fav-btn ${isFav ? 'is-favorite' : ''}" data-id="${item.id}">
                        ${isFav ? '&#9733; Saved Favorite' : '&#9734; Save Favorite'}
                    </button>
                </div>
            `;

            const favBtn = card.querySelector('.fav-btn');
            favBtn.addEventListener('click', () => toggleFavorite(item.id));

            menuGrid.appendChild(card);
        });
    }

    function calculateReadyTime(itemObj, qty) {
        const extraBatchMinutes = qty > 5 ? (qty - 5) * 5 : 0;
        const totalMinutes = itemObj.prepMinutes + extraBatchMinutes;
        const estimatedTotal = (itemObj.price * qty).toFixed(2);

        const readyDate = new Date();
        readyDate.setMinutes(readyDate.getMinutes() + totalMinutes);
        const timeString = readyDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return {
            itemId: itemObj.id,
            itemName: itemObj.name,
            quantity: qty,
            totalMinutes,
            estimatedTotal,
            readyTime: timeString
        };
    }

    function validateQuantity(qty) {
        if (Number.isNaN(qty) || qty < 1 || qty > 20) {
            qtyError.textContent = 'Please enter a valid quantity between 1 and 20 items.';
            qtyError.classList.remove('hidden');
            quantityInput.classList.add('input-invalid');
            return false;
        }
        qtyError.textContent = '';
        qtyError.classList.add('hidden');
        quantityInput.classList.remove('input-invalid');
        return true;
    }

    function displayOrderResult(orderData) {
        calcResult.classList.remove('hidden');
        resultText.textContent = `Success! ${orderData.quantity} × ${orderData.itemName} (Est. $${orderData.estimatedTotal}) will be ready around ${orderData.readyTime} (~${orderData.totalMinutes} mins).`;
    }

    function restoreSavedOrderUI() {
        if (!state.lastOrder) return;

        const matchingItem = MENU_ITEMS.find((item) => item.id === state.lastOrder.itemId);
        if (matchingItem) {
            itemSelect.value = matchingItem.id;
        }
        if (state.lastOrder.quantity) {
            quantityInput.value = state.lastOrder.quantity;
        }

        savedOrderBanner.classList.remove('hidden');
        savedOrderBanner.textContent = `Last saved estimate: ${state.lastOrder.quantity} × ${state.lastOrder.itemName} (Ready around ${state.lastOrder.readyTime})`;
    }

    function restoreSavedCustomerUI() {
        if (!state.lastCustomer) return;
        if (state.lastCustomer.name) {
            nameInput.value = state.lastCustomer.name;
        }
        if (state.lastCustomer.email) {
            emailInput.value = state.lastCustomer.email;
        }
    }

    function setFieldError(inputEl, errorEl, message) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
        inputEl.classList.add('input-invalid');
    }

    function clearFieldError(inputEl, errorEl) {
        errorEl.textContent = '';
        errorEl.classList.add('hidden');
        inputEl.classList.remove('input-invalid');
    }

    function validateContactForm() {
        let isValid = true;
        const nameVal = nameInput.value.trim();
        const emailVal = emailInput.value.trim();
        const messageVal = messageInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (nameVal === '') {
            setFieldError(nameInput, nameError, 'Please enter your full name.');
            isValid = false;
        } else if (nameVal.length < 2) {
            setFieldError(nameInput, nameError, 'Name must be at least 2 characters long.');
            isValid = false;
        } else {
            clearFieldError(nameInput, nameError);
        }

        if (emailVal === '') {
            setFieldError(emailInput, emailError, 'Please enter your email address.');
            isValid = false;
        } else if (!emailRegex.test(emailVal)) {
            setFieldError(emailInput, emailError, 'Please enter a valid email address (e.g., name@example.com).');
            isValid = false;
        } else {
            clearFieldError(emailInput, emailError);
        }

        if (messageVal.length > 0 && messageVal.length < 10) {
            setFieldError(messageInput, messageError, 'Please enter at least 10 characters for special requests or notes.');
            isValid = false;
        } else {
            clearFieldError(messageInput, messageError);
        }

        return isValid;
    }

    filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            filterButtons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            state.activeFilter = btn.dataset.filter;
            renderMenu();
        });
    });

    calcBtn.addEventListener('click', () => {
        const qty = parseInt(quantityInput.value, 10);
        if (!validateQuantity(qty)) {
            calcResult.classList.add('hidden');
            return;
        }

        const selectedItem = MENU_ITEMS.find((item) => item.id === itemSelect.value) || MENU_ITEMS[0];
        const orderSummary = calculateReadyTime(selectedItem, qty);

        state.lastOrder = orderSummary;
        saveLastOrderToStorage(orderSummary);
        restoreSavedOrderUI();
        displayOrderResult(orderSummary);
    });

    quantityInput.addEventListener('input', () => {
        if (!qtyError.classList.contains('hidden')) {
            validateQuantity(parseInt(quantityInput.value, 10));
        }
    });

    nameInput.addEventListener('input', () => {
        if (!nameError.classList.contains('hidden')) {
            validateContactForm();
        }
    });

    emailInput.addEventListener('input', () => {
        if (!emailError.classList.contains('hidden')) {
            validateContactForm();
        }
    });

    messageInput.addEventListener('input', () => {
        if (!messageError.classList.contains('hidden')) {
            validateContactForm();
        }
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        formFeedback.classList.add('hidden');

        if (!validateContactForm()) {
            return;
        }

        const customerName = nameInput.value.trim();
        const customerEmail = emailInput.value.trim();

        saveLastCustomerToStorage({
            name: customerName,
            email: customerEmail
        });

        formFeedback.classList.remove('hidden');
        formFeedback.textContent = `Thank you, ${customerName}! Your pre-order message has been received. We will confirm via ${customerEmail} shortly.`;

        messageInput.value = '';
        clearFieldError(messageInput, messageError);

        setTimeout(() => {
            formFeedback.classList.add('hidden');
        }, 6000);
    });

    populateItemSelect();
    updateFavoriteCount();
    renderMenu();
    restoreSavedOrderUI();
    restoreSavedCustomerUI();
});
