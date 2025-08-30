// Seleciona elementos do carrinho e do modal
const cartIcon = document.querySelector('.icons img'); // ícone do header
const cartDiv = document.getElementById('cart');       // div do carrinho

// Elementos do carrinho
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const customerName = document.getElementById('customer-name');
const customerCEP = document.getElementById('customer-cep');
const customerCity = document.getElementById('customer-city');
const customerAddress = document.getElementById('customer-address');
const customerComplement = document.getElementById('customer-complement');
const paymentMethods = document.getElementsByName('payment'); // radio buttons

// Array para armazenar itens do carrinho
let cart = [];

// Mostrar/ocultar modal
cartIcon.addEventListener('click', () => {
    cartDiv.classList.toggle('show');
});

// Adicionar itens
const addButtons = document.querySelectorAll('.box .btn');

addButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const box = e.target.closest('.box');
        const name = box.querySelector('h3').textContent;
        const price = parseFloat(box.querySelector('.price').textContent.replace('R$ ', '').replace(',', '.'));
        
        cart.push({ name, price });
        updateCart();
    });
});

// Atualizar carrinho
function updateCart() {
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;

        const li = document.createElement('li');
        li.textContent = `${item.name} - R$ ${item.price.toFixed(2)}`;

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'X';
        removeBtn.style.marginLeft = '10px';
        removeBtn.onclick = () => {
            cart.splice(index, 1);
            updateCart();
        };

        li.appendChild(removeBtn);
        cartItems.appendChild(li);
    });

    cartTotal.textContent = `Total: R$ ${total.toFixed(2)}`;

    checkCheckout();
}

// Verifica se o botão Finalizar Pedido pode ser habilitado
function checkCheckout() {
    const hasItems = cart.length > 0;
    const nameFilled = customerName.value.trim() !== '';
    const cepFilled = customerCEP.value.trim() !== '';
    const cityFilled = customerCity.value.trim() !== '';
    const addressFilled = customerAddress.value.trim() !== '';
    const paymentSelected = Array.from(paymentMethods).some(r => r.checked);

    if(hasItems && nameFilled && cepFilled && cityFilled && addressFilled && paymentSelected){
        checkoutBtn.disabled = false;
        checkoutBtn.style.border = '2px solid blue';
    } else {
        checkoutBtn.disabled = true;
        checkoutBtn.style.border = 'none';
    }
}

// Atualiza estado do botão ao preencher campos
customerName.addEventListener('input', checkCheckout);
customerCEP.addEventListener('input', checkCheckout);
customerAddress.addEventListener('input', checkCheckout);
customerComplement.addEventListener('input', checkCheckout);
Array.from(paymentMethods).forEach(r => r.addEventListener('change', checkCheckout));

// Buscar cidade pelo CEP via API
customerCEP.addEventListener('blur', () => {
    const cep = customerCEP.value.replace(/\D/g, '');
    if(cep.length === 8){
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if(!data.erro){
                    customerCity.value = data.localidade; // preenche cidade
                    customerAddress.value = data.logradouro; // opcional: rua
                } else {
                    alert('CEP não encontrado!');
                    customerCity.value = '';
                }
                checkCheckout();
            })
            .catch(err => {
                console.error(err);
                alert('Erro ao buscar CEP');
            });
    } else {
        customerCity.value = '';
    }
});

// Finalizar pedido (abre WhatsApp)
checkoutBtn.addEventListener('click', () => {
    const itemsText = cart.map(item => `${item.name} - R$ ${item.price.toFixed(2)}`).join('\n');
    const totalText = `Total: R$ ${cart.reduce((sum, i) => sum + i.price, 0).toFixed(2)}`;
    const paymentMethod = Array.from(paymentMethods).find(r => r.checked).value;
    
    const message = `Olá, quero fazer um pedido:\n\nItens:\n${itemsText}\n\n${totalText}\n\nNome: ${customerName.value}\nCEP: ${customerCEP.value}\nCidade: ${customerCity.value}\nEndereço: ${customerAddress.value}\nComplemento: ${customerComplement.value}\nForma de Pagamento: ${paymentMethod}`;

    const phoneNumber = '5591985621372'; // Coloque aqui o número do vendedor no formato internacional sem '+'
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, '_blank');
});

// Botão Fechar Carrinho
const closeCartBtn = document.getElementById('close-cart');

closeCartBtn.addEventListener('click', () => {
    cartDiv.classList.remove('show'); // fecha a modal
});
