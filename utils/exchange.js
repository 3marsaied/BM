const axios = require('axios');

const EXCHANGE_RATE_API_URL = 'https://v6.exchangerate-api.com/v6/4bcaf61d1748c860020c9bd2/latest/';

async function convertCurrency(fromCurrency, toCurrency, amount) {
    if (!fromCurrency || !toCurrency || !amount) {
        throw new Error('Please provide fromCurrency, toCurrency, and amount.');
    }

    try {
        const response = await axios.get(`${EXCHANGE_RATE_API_URL}${fromCurrency}`);
        const rates = response.data.conversion_rates;
        const rate = rates[toCurrency];

        if (!rate) {
            throw new Error('Invalid target currency.');
        }

        const convertedAmount = amount * rate;
        return convertedAmount;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        throw new Error('Error fetching exchange rates.');
    }
}

module.exports = { convertCurrency };
