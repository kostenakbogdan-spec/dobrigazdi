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

// Елементи детального перегляду товару
const productModal = document.getElementById('product-modal');
const modalImg = document.getElementById('modal-product-img');
const modalTitle = document.getElementById('modal-product-title');
const modalDesc = document.getElementById('modal-product-desc');
const modalPrice = document.getElementById('modal-product-price');
const modalCloseBtn = document.querySelector('.product-modal-close');

// 1. ВІДКРИТТЯ ТА ЗАКРИТТЯ КОШИКА
if (cartToggleBtn) {
    cartToggleBtn.addEventListener('click', () => {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('open');
    });
}

const closeCart = () => {
    if (cartSidebar) cartSidebar.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('open');
};

if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

// 2. ЛОГІКА КНОПОК КІЛЬКОСТІ В КАРТКАХ ТОВАРІВ
document.querySelectorAll('.quantity-selector').forEach(selector => {
    const minusBtn = selector.querySelector('.minus');
    const plusBtn = selector.querySelector('.plus');
    const qtyInput = selector.querySelector('.qty-input');

    if (minusBtn && plusBtn && qtyInput) {
        minusBtn.addEventListener('click', () => {
            let val = parseInt(qtyInput.value);
            if (val > 1) qtyInput.value = val - 1;
        });

        plusBtn.addEventListener('click', () => {
            let val = parseInt(qtyInput.value);
            qtyInput.value = val + 1;
        });
    }
});

// 3. ДОДАВАННЯ В КОШИК
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        if (!card) return;
        
        const id = card.dataset.id;
        const name = card.dataset.name;
        const price = parseInt(card.dataset.price);
        const qtyInput = card.querySelector('.qty-input');
        const quantity = qtyInput ? parseInt(qtyInput.value) : 1;

        addToCart(id, name, price, quantity);
        
        // Скидаємо лічильник у картці назад на 1
        if (qtyInput) qtyInput.value = 1;
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

// 4. ОНОВЛЕННЯ КОШИКА НА ЕКРАНІ
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

// 5. ВИДАЛЕННЯ З КОШИКА
window.removeFromCart = function(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
};

// 6. ВІДКРИТТЯ / ЗАКРИТТЯ МОДАЛЬНОГО ВІКНА ЗАМОВЛЕННЯ
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Додайте товари до кошика перед оформленням!');
            return;
        }
        // Закриваємо бічну панель кошика і відкриваємо форму
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

// 7. НАДІСЛАННЯ ЗАМОВЛЕННЯ В TELEGRAM
if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Запобігаємо перезавантаженню сторінки

        // Збираємо дані клієнта
        const name = document.getElementById('client-name').value;
        const phone = document.getElementById('client-phone').value;
        const delivery = document.getElementById('delivery-method').value;
        const address = document.getElementById('delivery-address').value || 'Не вказано';
        const comment = document.getElementById('client-comment').value || 'Немає коментаря';

        // Формуємо список товарів для повідомлення
        let itemsText = '';
        let totalSum = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            totalSum += itemTotal;
            itemsText += `${index + 1}. 🧀 *${item.name}* — ${item.quantity} шт. x ${item.price} грн = ${itemTotal} грн\n`;
        });

        // Формуємо красивий текст для Telegram
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

        // API URL для надсилання повідомлення бота
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

        // Надсилаємо POST-запит у Telegram
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
                // Закриваємо форму оформлення замовлення
                closeOrderModal();
                
                // Відкриваємо вікно успіху
                if (successModal) successModal.classList.add('open');
                if (modalOverlay) modalOverlay.classList.add('open');

                // Очищуємо кошик та форму
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

// Клікнувши по кнопці "Чудово" у вікні успіху — закриваємо його повністю
if (closeSuccessBtn) {
    closeSuccessBtn.addEventListener('click', () => {
        if (successModal) successModal.classList.remove('open');
        if (modalOverlay) modalOverlay.classList.remove('open');
    });
}

// ================= БЕЗПЕЧНА ЛОГІКА ДЕТАЛЬНОГО ПЕРЕГЛЯДУ ТОВАРУ =================
if (productModal && modalCloseBtn) {
    
    // Вішаємо подію кліку на зображення кожної картки товару
    document.querySelectorAll('.product-img-container').forEach(container => {
        container.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (!card) return; // Захист на випадок, якщо картку не знайдено
            
            // Зчитуємо дані з картки
            const name = card.dataset.name || 'Товар';
            const price = card.dataset.price || '0';
            const imgEl = card.querySelector('.product-img');
            const imgSrc = imgEl ? imgEl.src : '';
            
            // Знаходимо прихований детальний опис у цій картці
            const detailedDescElement = card.querySelector('.detailed-description');
            const descriptionHTML = detailedDescElement ? detailedDescElement.innerHTML : 'Опис для цього товару скоро з’явиться.';

            // Безпечно підставляємо дані у модальне вікно
            if (modalTitle) modalTitle.innerText = name;
            if (modalImg) modalImg.src = imgSrc;
            if (modalDesc) modalDesc.innerHTML = descriptionHTML;
            if (modalPrice) modalPrice.innerText = `${price} грн/кг`;

            // Відкриваємо вікно
            productModal.classList.add('open');
        });
    });

    // Закриття модального вікна при кліку на хрестик
    modalCloseBtn.addEventListener('click', () => {
        productModal.classList.remove('open');
    });

    // Закриття при кліку на затемнене тло навколо вікна
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) {
            productModal.classList.remove('open');
        }
    });
}