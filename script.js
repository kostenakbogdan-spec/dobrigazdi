let cart = [];

// ================= НАЛАШТУВАННЯ TELEGRAM =================
// Якщо потрібно змінити отримувача — просто встав сюди нові дані!
const TELEGRAM_BOT_TOKEN = '8984740382:AAGQ9fcO-4iMJjJyzao8BcQPkTAk8AJj-FY'; 
const TELEGRAM_CHAT_ID = '6671894453'; 
// ========================================================

// Елементи інтерфейсу кошика
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const cartCloseBtn = document.getElementById('cart-close-btn');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartCount = document.getElementById('cart-count');

const successModal = document.getElementById('success-modal');
const closeSuccessBtn = document.getElementById('close-success-btn');

// Елементи модального вікна замовлення
const orderModal = document.getElementById('order-modal');
const modalOverlay = document.getElementById('modal-overlay');
const checkoutBtn = document.getElementById('checkout-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const checkoutForm = document.getElementById('checkout-form');

// Елементи детального перегляду товару (модалка)
const productModal = document.getElementById('product-modal');
const modalImg = document.getElementById('modal-product-img');
const modalTitle = document.getElementById('modal-product-title');
const modalDesc = document.getElementById('modal-product-desc');
const modalPrice = document.getElementById('modal-product-price');
const modalCloseBtn = document.querySelector('.product-modal-close');

// ================= ФУНКЦІЯ ДИНАМІЧНОГО ПЕРЕРАХУНКУ ЦІНИ В КАРТЦІ =================
function recalculateCardPrice(card) {
    const priceDisplay = card.querySelector('.price-display');
    if (!priceDisplay) return;

    const price100g = parseInt(card.getAttribute('data-price-100g'));
    const qtyInput = card.querySelector('.qty-input');
    const quantity = qtyInput ? parseInt(qtyInput.value) : 1;

    // Шукаємо активну кнопку ваги в цій картці
    const activeWeightBtn = card.querySelector('.weight-btn.active');
    
    if (price100g && activeWeightBtn) {
        const weight = parseInt(activeWeightBtn.dataset.weight);
        const totalPrice = price100g * (weight / 100) * quantity;
        priceDisplay.innerText = `${totalPrice} грн`;
    }
}

// Ініціалізація інтерактивних елементів у картках (вага та кількість +/-)
document.querySelectorAll('.product-card').forEach(card => {
    // 1. Обробка вибору ваги
    const weightButtons = card.querySelectorAll('.weight-btn');
    weightButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            weightButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            recalculateCardPrice(card);
        });
    });

    // 2. Кнопки зміни кількості +/-
    const minusBtn = card.querySelector('.qty-btn.minus');
    const plusBtn = card.querySelector('.qty-btn.plus');
    const qtyInput = card.querySelector('.qty-input');

    if (minusBtn && plusBtn && qtyInput) {
        minusBtn.addEventListener('click', () => {
            let val = parseInt(qtyInput.value);
            if (val > 1) {
                qtyInput.value = val - 1;
                recalculateCardPrice(card);
            }
        });

        plusBtn.addEventListener('click', () => {
            let val = parseInt(qtyInput.value);
            qtyInput.value = val + 1;
            recalculateCardPrice(card);
        });
    }
});

// ================= 1. ВІДКРИТТЯ ТА ЗАКРИТТЯ КОШИКА =================
if (cartToggleBtn) {
    cartToggleBtn.addEventListener('click', () => {
        if (cartSidebar) cartSidebar.classList.add('open');
        if (cartOverlay) cartOverlay.classList.add('open');
    });
}

const closeCart = () => {
    if (cartSidebar) cartSidebar.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('open');
};

if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

// ================= 2. ДОДАВАННЯ В КОШИК + АНІМАЦІЯ ПОЛЬОТУ =================
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        if (!card) return;
        
        const id = card.dataset.id;
        let name = card.dataset.name;
        const qtyInput = card.querySelector('.qty-input');
        const quantity = qtyInput ? parseInt(qtyInput.value) : 1;
        let itemPrice = 0;
        let cartItemId = id;

        // Перевіряємо, чи цей товар має вибір ваги (за наявністю атрибуту data-price-100g)
        const price100gAttr = card.getAttribute('data-price-100g');
        const activeWeightBtn = card.querySelector('.weight-btn.active');

        if (price100gAttr && activeWeightBtn) {
            const price100g = parseInt(price100gAttr);
            const weight = parseInt(activeWeightBtn.dataset.weight);
            itemPrice = price100g * (weight / 100);
            name = `${name} (${weight}г)`; // Додаємо вагу до назви у кошику
            cartItemId = `${id}_${weight}`; // Створюємо унікальний ID для кожної ваги
        } else {
            // Для звичайної молочки, де ціна фіксована за штуку/літр/банку
            itemPrice = parseInt(card.dataset.price);
        }

       // --- ЕФЕКТ ПОЛЬОТУ З ПЕРЕТВОРЕННЯМ НА ЛОГОТИП СИРУ ---
        const imgToFly = card.querySelector('.product-img');
        const cartButton = document.getElementById('cart-toggle-btn');

        if (imgToFly && cartButton) {
            const imgRect = imgToFly.getBoundingClientRect();
            const cartRect = cartButton.getBoundingClientRect();

            // 1. Створюємо загальний контейнер для польоту
            const flyingWrapper = document.createElement('div');
            flyingWrapper.classList.add('flying-wrapper');
            
            // Встановлюємо початкові координати (точно як у фото картки)
            flyingWrapper.style.top = `${imgRect.top}px`;
            flyingWrapper.style.left = `${imgRect.left}px`;
            flyingWrapper.style.width = `${imgRect.width}px`;
            flyingWrapper.style.height = `${imgRect.height}px`;

            // 2. Створюємо внутрішню частину з картинкою
            const imgPart = imgToFly.cloneNode();
            imgPart.classList.add('flying-img-part');

            // 3. Створюємо іконку сиру (логотип)
            const cheesePart = document.createElement('div');
            cheesePart.classList.add('flying-cheese-icon');
            cheesePart.innerHTML = '🧀'; // Твій мінімалістичний сир

            // Збираємо все докупи
            flyingWrapper.appendChild(imgPart);
            flyingWrapper.appendChild(cheesePart);
            document.body.appendChild(flyingWrapper);

            // 4. Запускаємо перший етап: миттєве зменшення фото на 50%
            setTimeout(() => {
                flyingWrapper.classList.add('in-flight');
                
                // 5. Одночасно спрямовуємо весь контейнер до кошика
                flyingWrapper.style.top = `${cartRect.top + 5}px`;
                flyingWrapper.style.left = `${cartRect.left + 15}px`;
                // Зменшуємо фінальний контейнер під розмір іконки в кошику
                flyingWrapper.style.width = '30px';
                flyingWrapper.style.height = '30px';
            }, 50);

            // 6. Фінал польоту (приземлення в кошик через 900мс)
            setTimeout(() => {
                flyingWrapper.remove(); // Видаляємо елементи з екрану

                // Ефектне «впускання» в кошик із пружинистим погойдуванням
                cartButton.classList.add('basket-animate');
                
                setTimeout(() => {
                    cartButton.classList.remove('basket-animate');
                }, 650);

            }, 950);
        }
        // -----------------------------------------------------
        // ------------------------------------

        addToCart(cartItemId, name, itemPrice, quantity);
        
        // Скидаємо лічильник в картці назад на 1
        if (qtyInput) {
            qtyInput.value = 1;
            recalculateCardPrice(card);
        }
    });
});

function addToCart(id, name, price, quantity) {
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id, name, price, quantity });
    }

    updateCartUI();
}

// ================= 3. ОНОВЛЕННЯ КОШИКА НА ЕКРАНІ =================
function updateCartUI() {
    if (!cartItemsContainer) return;
    
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-text">Кошик порожній</p>';
        if (cartTotalPrice) cartTotalPrice.innerText = '0 грн';
        if (cartCount) cartCount.innerText = '0';
        return;
    }

    let total = 0;
    let totalItems = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        totalItems += item.quantity;

        const itemHTML = `
            <div class="cart-item">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>${item.quantity} шт x ${item.price} грн = <b>${itemTotal} грн</b></p>
                </div>
                <button class="remove-item-btn" onclick="removeFromCart('${item.id}')">&times;</button>
            </div>
        `;
        cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
    });

    if (cartTotalPrice) cartTotalPrice.innerText = `${total} грн`;
    if (cartCount) cartCount.innerText = totalItems;
}

// ================= 4. ВИДАЛЕННЯ З КОШИКА =================
window.removeFromCart = function(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
};

// ================= 5. МОДАЛЬНЕ ВІКНО ЗАМОВЛЕННЯ =================
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Додайте товари до кошика перед оформленням!');
            return;
        }
        closeCart();
        if (orderModal) orderModal.classList.add('open');
        if (modalOverlay) modalOverlay.classList.add('open');
    });
}

const closeOrderModal = () => {
    if (orderModal) orderModal.classList.remove('open');
    if (modalOverlay) modalOverlay.classList.remove('open');
};

if (closeModalBtn) closeModalBtn.addEventListener('click', closeOrderModal);
if (modalOverlay) modalOverlay.addEventListener('click', closeOrderModal);

// ================= 6. НАДІСЛАННЯ ЗАМОВЛЕННЯ В TELEGRAM =================
if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('client-name').value;
        const phone = document.getElementById('client-phone').value;
        const delivery = document.getElementById('delivery-method').value;
        const address = document.getElementById('delivery-address').value || 'Не вказано';
        const comment = document.getElementById('client-comment').value || 'Немає коментаря';

        let itemsText = '';
        let totalSum = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            totalSum += itemTotal;
            itemsText += `${index + 1}. 🧀 *${item.name}* — ${item.quantity} шт. x ${item.price} грн = ${itemTotal} грн\n`;
        });

        const message = `
📦 *НОВЕ ЗАМОВЛЕННЯ НА САЙТІ!*

👤 *Клієнт:* ${name}
📞 *Телефон:* ${phone}
🚚 *Доставка:* ${delivery}
📍 *Адреса:* ${address}

🛒 *Товари:*
${itemsText}
💰 *Разом до сплати:* *${totalSum} грн*

💬 *Коментар:* _${comment}_
        `;

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        })
        .then(response => {
            if (response.ok) {
                closeOrderModal();
                
                if (successModal) successModal.classList.add('open');
                if (modalOverlay) modalOverlay.classList.add('open');

                cart = [];
                updateCartUI();
                checkoutForm.reset();
            } else {
                alert('Помилка надсилання замовлення. Перевірте правильність Telegram токенів!');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Сталася помилка з\'єднання. Спробуйте ще раз пізніше.');
        });
    });
}

if (closeSuccessBtn) {
    closeSuccessBtn.addEventListener('click', () => {
        if (successModal) successModal.classList.remove('open');
        if (modalOverlay) modalOverlay.classList.remove('open');
    });
}

// ================= 7. БЕЗПЕЧНА ЛОГІКА ДЕТАЛЬНОГО ПЕРЕГЛЯДУ ТОВАРУ =================
// ================= 7. БЕЗПЕЧНА ЛОГІКА ДЕТАЛЬНОГО ПЕРЕГЛЯДУ ТОВАРУ =================
if (productModal && modalCloseBtn) {
    document.querySelectorAll('.product-img-container').forEach(container => {
        container.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (!card) return;
            
            const name = card.dataset.name || 'Товар';
            const imgEl = card.querySelector('.product-img');
            const imgSrc = imgEl ? imgEl.src : '';
            
            const detailedDescElement = card.querySelector('.detailed-description');
            const descriptionHTML = detailedDescElement ? detailedDescElement.innerHTML : 'Опис для цього товару скоро з’явиться.';

            // --- НОВА ЛОГІКА ВІДОБРАЖЕННЯ ЦІНИ У ВІКНІ ---
            let priceText = '';
            const price100g = card.getAttribute('data-price-100g');
            const fixedPrice = card.dataset.price;

            if (price100g) {
                // Якщо це сир на вагу, пишемо базову ціну за 100 грамів
                priceText = `${price100g} грн / 100г`;
            } else if (fixedPrice) {
                // Якщо це звичайна молочка (молоко, масло тощо)
                const priceNormal = card.querySelector('.price');
                priceText = priceNormal ? priceNormal.innerText : `${fixedPrice} грн`;
            }
            // ---------------------------------------------

            if (modalTitle) modalTitle.innerText = name;
            if (modalImg) modalImg.src = imgSrc;
            if (modalDesc) modalDesc.innerHTML = descriptionHTML;
            if (modalPrice) modalPrice.innerText = priceText; // Встановлюємо нову ціну

            productModal.classList.add('open');
        });
    });

    modalCloseBtn.addEventListener('click', () => {
        productModal.classList.remove('open');
    });

    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) {
            productModal.classList.remove('open');
        }
    });
}