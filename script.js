// Зберігаємо кошик у пам'яті
let cart = [];

// Елементи інтерфейсу
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const cartCloseBtn = document.getElementById('cart-close-btn');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartCount = document.getElementById('cart-count');

// 1. ВІДКРИТТЯ ТА ЗАКРИТТЯ КОШИКА
cartToggleBtn.addEventListener('click', () => {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('open');
});

const closeCart = () => {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
};

cartCloseBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// 2. ЛОГІКА КНОПОК КІЛЬКОСТІ В КАРТКАХ ТОВАРІВ
document.querySelectorAll('.quantity-selector').forEach(selector => {
    const minusBtn = selector.querySelector('.minus');
    const plusBtn = selector.querySelector('.plus');
    const qtyInput = selector.querySelector('.qty-input');

    minusBtn.addEventListener('click', () => {
        let val = parseInt(qtyInput.value);
        if (val > 1) qtyInput.value = val - 1;
    });

    plusBtn.addEventListener('click', () => {
        let val = parseInt(qtyInput.value);
        qtyInput.value = val + 1;
    });
});

// 3. ДОДАВАННЯ В КОШИК
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        const id = card.dataset.id;
        const name = card.dataset.name;
        const price = parseInt(card.dataset.price);
        const qtyInput = card.querySelector('.qty-input');
        const quantity = parseInt(qtyInput.value);

        addToCart(id, name, price, quantity);
        
        // Скидаємо лічильник у картці назад на 1
        qtyInput.value = 1;
    });
});

function addToCart(id, name, price, quantity) {
    // Перевіряємо, чи є вже такий товар в кошику
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
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-text">Кошик порожній</p>';
        cartTotalPrice.innerText = '0 грн';
        cartCount.innerText = '0';
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

    cartTotalPrice.innerText = `${total} грн`;
    cartCount.innerText = totalItems;
}

// 5. ВИДАЛЕННЯ З КОШИКА
window.removeFromCart = function(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
};

// 6. ОФОРМЛЕННЯ ЗАМОВЛЕННЯ (Проста заглушка)
document.getElementById('checkout-btn').addEventListener('click', () => {
    if(cart.length === 0) {
        alert('Додайте товари до кошика перед оформленням!');
        return;
    }
    alert('Дякуємо за замовлення! Цю функцію ми налаштуємо далі.');
});