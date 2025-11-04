// SimpleAPI.js - Minimal working currency API
async function fetchUSDToBRL() {
    try {
        const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
        const data = await response.json();
        
        if (data && data.USDBRL && data.USDBRL.bid) {
            return {
                success: true,
                rate: parseFloat(data.USDBRL.bid),
                timestamp: new Date()
            };
        }
        
        return { success: false, error: 'Invalid response' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}