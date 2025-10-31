/**
 * CurrencyAPI_Fixed - Working version of the currency API
 */
class CurrencyAPI_Fixed {
    static API_ENDPOINT = 'https://economia.awesomeapi.com.br/json/last/USD-BRL';
    
    static async getUSDToBRL() {
        try {
            const response = await fetch(this.API_ENDPOINT);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // The API returns: { "USDBRL": { "bid": "5.4154", ... } }
            if (data && data.USDBRL && data.USDBRL.bid) {
                const rate = parseFloat(data.USDBRL.bid);
                
                if (!isNaN(rate) && rate > 0) {
                    return {
                        rate: rate,
                        timestamp: new Date(),
                        source: 'AwesomeAPI-Brazil',
                        success: true
                    };
                }
            }
            
            throw new Error('Invalid API response structure');
            
        } catch (error) {
            console.error('CurrencyAPI_Fixed: Error:', error);
            return {
                rate: null,
                timestamp: new Date(),
                source: 'AwesomeAPI-Brazil',
                success: false,
                error: error.message
            };
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CurrencyAPI_Fixed;
}