import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface MetalPrice {
  gold: number;
  silver: number;
}

const MetalPrices = () => {
  const [prices, setPrices] = useState<MetalPrice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Fetch gold price
        const goldResponse = await fetch('https://api.metalpriceapi.com/v1/latest?api_key=b602916c15c670b26e9c703683a80c2d&base=XAU&currencies=USD');
        const goldData = await goldResponse.json();
        
        // Fetch silver price
        const silverResponse = await fetch('https://api.metalpriceapi.com/v1/latest?api_key=b602916c15c670b26e9c703683a80c2d&base=XAG&currencies=USD');
        const silverData = await silverResponse.json();
        
        console.log('Metal prices API response:', { gold: goldData, silver: silverData });
        
        setPrices({
          gold: goldData.rates.USD,
          silver: silverData.rates.USD
        });
      } catch (err) {
        console.error('Error fetching metal prices:', err);
        setError('Failed to fetch prices');
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch immediately
    fetchPrices();

    // Then fetch every 5 minutes
    const interval = setInterval(fetchPrices, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <Card className="p-3">
      <h3 className="text-sm font-semibold mb-2">Live Metal Prices</h3>
      {isLoading ? (
        <div className="flex items-center justify-center h-12">
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-12">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      ) : prices ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-2 bg-yellow-50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-0.5">Gold/oz</p>
            <p className="text-lg font-bold text-yellow-600">
              {formatPrice(prices.gold)}
            </p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-0.5">Silver/oz</p>
            <p className="text-lg font-bold text-gray-600">
              {formatPrice(prices.silver)}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-12">
          <p className="text-muted-foreground text-sm">No data available</p>
        </div>
      )}
      <div className="mt-1 text-center text-xs text-muted-foreground">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </Card>
  );
};

export default MetalPrices; 