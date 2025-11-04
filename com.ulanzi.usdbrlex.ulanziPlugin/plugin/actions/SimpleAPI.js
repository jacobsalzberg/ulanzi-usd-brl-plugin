// SimpleAPI.js - Minimal working currency API
// Uses AwesomeAPI with average of bid and high prices to match Google rates
async function fetchUSDToBRL() {
    try {
        const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
        const data = await response.json();
        
        // Calculate average between bid and high to approximate Google's retail rate
        if (data && data.USDBRL && data.USDBRL.bid && data.USDBRL.high) {
            const bid = parseFloat(data.USDBRL.bid);
            const high = parseFloat(data.USDBRL.high);
            const average = (bid + high) / 2;
            
            return {
                success: true,
                rate: average,
                timestamp: new Date()
            };
        }
        
        return { success: false, error: 'Invalid response' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}