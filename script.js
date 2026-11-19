document.addEventListener('DOMContentLoaded', () => {
    const calcBtn = document.getElementById('calcBtn');
    const itemSelect = document.getElementById('itemSelect');
    const quantityInput = document.getElementById('quantity');
    const calcResult = document.getElementById('calcResult');
    const resultText = document.getElementById('resultText');

    calcBtn.addEventListener('click', () => {
        const item = itemSelect.value;
        const qty = parseInt(quantityInput.value, 10) || 1;

        let baseMinutes = 30;
        if (item === 'sourdough') baseMinutes = 45;
        else if (item === 'croissant') baseMinutes = 30;
        else if (item === 'tart') baseMinutes = 25;

        const totalMinutes = baseMinutes + (qty > 5 ? (qty - 5) * 5 : 0);

        const now = new Date();
        now.setMinutes(now.getMinutes() + totalMinutes);
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const historyData = {
            item: itemSelect.options[itemSelect.selectedIndex].text,
            quantity: qty,
            readyTime: timeString
        };
        localStorage.setItem('lastBakeryOrder', JSON.stringify(historyData));

        calcResult.classList.remove('hidden');
        resultText.textContent = `Success! Your batch of ${qty} item(s) will be freshly baked and ready at approximately ${timeString}.`;
    });

    const savedOrder = localStorage.getItem('lastBakeryOrder');
    if (savedOrder) {
        try {
            const data = JSON.parse(savedOrder);
            console.log('Last calculated order from localStorage:', data);
        } catch (e) {
            console.error('Error reading localStorage', e);
        }
    }

    const contactForm = document.getElementById('contactForm');
    const formFeedback = document.getElementById('formFeedback');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();

        if (name === '' || email === '') {
            alert('Please fill in all required fields.');
            return;
        }

        formFeedback.classList.remove('hidden');
        formFeedback.textContent = `Thank you, ${name}! Your pre-order message has been received. We will confirm via email shortly.`;

        contactForm.reset();

        setTimeout(() => {
            formFeedback.classList.add('hidden');
        }, 5000);
    });
});
