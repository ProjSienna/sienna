import { useState, useEffect } from 'react';

// Comprehensive tax rate data by country, state/province, and category
const TAX_DATA = {
  US: {
    name: 'United States',
    taxType: 'Sales Tax',
    states: {
      AL: { name: 'Alabama', rate: 4, note: 'State sales tax' },
      AK: { name: 'Alaska', rate: 0, note: 'No state sales tax' },
      AZ: { name: 'Arizona', rate: 5.6, note: 'State sales tax' },
      AR: { name: 'Arkansas', rate: 6.5, note: 'State sales tax' },
      CA: { name: 'California', rate: 7.25, note: 'State sales tax (local may add more)' },
      CO: { name: 'Colorado', rate: 2.9, note: 'State sales tax' },
      CT: { name: 'Connecticut', rate: 6.35, note: 'State sales tax' },
      DE: { name: 'Delaware', rate: 0, note: 'No state sales tax' },
      FL: { name: 'Florida', rate: 6, note: 'State sales tax' },
      GA: { name: 'Georgia', rate: 4, note: 'State sales tax' },
      HI: { name: 'Hawaii', rate: 4, note: 'General excise tax' },
      ID: { name: 'Idaho', rate: 6, note: 'State sales tax' },
      IL: { name: 'Illinois', rate: 6.25, note: 'State sales tax' },
      IN: { name: 'Indiana', rate: 7, note: 'State sales tax' },
      IA: { name: 'Iowa', rate: 6, note: 'State sales tax' },
      KS: { name: 'Kansas', rate: 6.5, note: 'State sales tax' },
      KY: { name: 'Kentucky', rate: 6, note: 'State sales tax' },
      LA: { name: 'Louisiana', rate: 4.45, note: 'State sales tax' },
      ME: { name: 'Maine', rate: 5.5, note: 'State sales tax' },
      MD: { name: 'Maryland', rate: 6, note: 'State sales tax' },
      MA: { name: 'Massachusetts', rate: 6.25, note: 'State sales tax' },
      MI: { name: 'Michigan', rate: 6, note: 'State sales tax' },
      MN: { name: 'Minnesota', rate: 6.875, note: 'State sales tax' },
      MS: { name: 'Mississippi', rate: 7, note: 'State sales tax' },
      MO: { name: 'Missouri', rate: 4.225, note: 'State sales tax' },
      MT: { name: 'Montana', rate: 0, note: 'No state sales tax' },
      NE: { name: 'Nebraska', rate: 5.5, note: 'State sales tax' },
      NV: { name: 'Nevada', rate: 6.85, note: 'State sales tax' },
      NH: { name: 'New Hampshire', rate: 0, note: 'No state sales tax' },
      NJ: { name: 'New Jersey', rate: 6.625, note: 'State sales tax' },
      NM: { name: 'New Mexico', rate: 5.125, note: 'Gross receipts tax' },
      NY: { name: 'New York', rate: 4, note: 'State sales tax (local may add more)' },
      NC: { name: 'North Carolina', rate: 4.75, note: 'State sales tax' },
      ND: { name: 'North Dakota', rate: 5, note: 'State sales tax' },
      OH: { name: 'Ohio', rate: 5.75, note: 'State sales tax' },
      OK: { name: 'Oklahoma', rate: 4.5, note: 'State sales tax' },
      OR: { name: 'Oregon', rate: 0, note: 'No state sales tax' },
      PA: { name: 'Pennsylvania', rate: 6, note: 'State sales tax' },
      RI: { name: 'Rhode Island', rate: 7, note: 'State sales tax' },
      SC: { name: 'South Carolina', rate: 6, note: 'State sales tax' },
      SD: { name: 'South Dakota', rate: 4.5, note: 'State sales tax' },
      TN: { name: 'Tennessee', rate: 7, note: 'State sales tax' },
      TX: { name: 'Texas', rate: 6.25, note: 'State sales tax' },
      UT: { name: 'Utah', rate: 6.1, note: 'State sales tax' },
      VT: { name: 'Vermont', rate: 6, note: 'State sales tax' },
      VA: { name: 'Virginia', rate: 5.3, note: 'State sales tax' },
      WA: { name: 'Washington', rate: 6.5, note: 'State sales tax' },
      WV: { name: 'West Virginia', rate: 6, note: 'State sales tax' },
      WI: { name: 'Wisconsin', rate: 5, note: 'State sales tax' },
      WY: { name: 'Wyoming', rate: 4, note: 'State sales tax' },
    },
    categories: {
      general: { modifier: 1, note: 'Standard sales tax applies' },
      consulting: { modifier: 0, note: 'Most states do not tax services' },
      digital: { modifier: 1, note: 'Varies by state - some tax digital goods' },
      saas: { modifier: 1, note: 'Varies by state - increasingly taxed' },
      goods: { modifier: 1, note: 'Standard sales tax applies' },
    }
  },
  CA: {
    name: 'Canada',
    taxType: 'GST/HST/PST',
    states: {
      AB: { name: 'Alberta', rate: 5, note: 'GST only' },
      BC: { name: 'British Columbia', rate: 12, note: 'GST 5% + PST 7%' },
      MB: { name: 'Manitoba', rate: 12, note: 'GST 5% + PST 7%' },
      NB: { name: 'New Brunswick', rate: 15, note: 'HST (Harmonized Sales Tax)' },
      NL: { name: 'Newfoundland and Labrador', rate: 15, note: 'HST' },
      NT: { name: 'Northwest Territories', rate: 5, note: 'GST only' },
      NS: { name: 'Nova Scotia', rate: 15, note: 'HST' },
      NU: { name: 'Nunavut', rate: 5, note: 'GST only' },
      ON: { name: 'Ontario', rate: 13, note: 'HST' },
      PE: { name: 'Prince Edward Island', rate: 15, note: 'HST' },
      QC: { name: 'Quebec', rate: 14.975, note: 'GST 5% + QST 9.975%' },
      SK: { name: 'Saskatchewan', rate: 11, note: 'GST 5% + PST 6%' },
      YT: { name: 'Yukon', rate: 5, note: 'GST only' },
    },
    categories: {
      general: { modifier: 1, note: 'Standard GST/HST/PST applies' },
      consulting: { modifier: 1, note: 'GST/HST applies to services' },
      digital: { modifier: 1, note: 'GST/HST applies' },
      saas: { modifier: 1, note: 'GST/HST applies' },
      goods: { modifier: 1, note: 'Standard GST/HST/PST applies' },
    }
  },
  UK: {
    name: 'United Kingdom',
    taxType: 'VAT',
    states: {
      GB: { name: 'Great Britain', rate: 20, note: 'Standard VAT rate' },
      NI: { name: 'Northern Ireland', rate: 20, note: 'Standard VAT rate' },
    },
    categories: {
      general: { modifier: 1, note: 'Standard VAT 20%' },
      consulting: { modifier: 1, note: 'Standard VAT 20%' },
      digital: { modifier: 1, note: 'Standard VAT 20%' },
      saas: { modifier: 1, note: 'Standard VAT 20%' },
      goods: { modifier: 1, note: 'Standard VAT 20%' },
    }
  },
  AU: {
    name: 'Australia',
    taxType: 'GST',
    states: {
      NSW: { name: 'New South Wales', rate: 10, note: 'GST (Goods and Services Tax)' },
      VIC: { name: 'Victoria', rate: 10, note: 'GST' },
      QLD: { name: 'Queensland', rate: 10, note: 'GST' },
      WA: { name: 'Western Australia', rate: 10, note: 'GST' },
      SA: { name: 'South Australia', rate: 10, note: 'GST' },
      TAS: { name: 'Tasmania', rate: 10, note: 'GST' },
      ACT: { name: 'Australian Capital Territory', rate: 10, note: 'GST' },
      NT: { name: 'Northern Territory', rate: 10, note: 'GST' },
    },
    categories: {
      general: { modifier: 1, note: 'GST 10% applies' },
      consulting: { modifier: 1, note: 'GST 10% applies' },
      digital: { modifier: 1, note: 'GST 10% applies' },
      saas: { modifier: 1, note: 'GST 10% applies' },
      goods: { modifier: 1, note: 'GST 10% applies' },
    }
  },
  EU: {
    name: 'European Union',
    taxType: 'VAT',
    states: {
      DE: { name: 'Germany', rate: 19, note: 'Standard VAT rate' },
      FR: { name: 'France', rate: 20, note: 'Standard VAT rate' },
      IT: { name: 'Italy', rate: 22, note: 'Standard VAT rate' },
      ES: { name: 'Spain', rate: 21, note: 'Standard VAT rate' },
      NL: { name: 'Netherlands', rate: 21, note: 'Standard VAT rate' },
      BE: { name: 'Belgium', rate: 21, note: 'Standard VAT rate' },
      AT: { name: 'Austria', rate: 20, note: 'Standard VAT rate' },
      PL: { name: 'Poland', rate: 23, note: 'Standard VAT rate' },
      SE: { name: 'Sweden', rate: 25, note: 'Standard VAT rate' },
      DK: { name: 'Denmark', rate: 25, note: 'Standard VAT rate' },
      FI: { name: 'Finland', rate: 24, note: 'Standard VAT rate' },
      IE: { name: 'Ireland', rate: 23, note: 'Standard VAT rate' },
      PT: { name: 'Portugal', rate: 23, note: 'Standard VAT rate' },
      GR: { name: 'Greece', rate: 24, note: 'Standard VAT rate' },
      CZ: { name: 'Czech Republic', rate: 21, note: 'Standard VAT rate' },
      RO: { name: 'Romania', rate: 19, note: 'Standard VAT rate' },
      HU: { name: 'Hungary', rate: 27, note: 'Standard VAT rate (highest in EU)' },
    },
    categories: {
      general: { modifier: 1, note: 'Standard VAT applies' },
      consulting: { modifier: 1, note: 'Standard VAT applies' },
      digital: { modifier: 1, note: 'Standard VAT applies' },
      saas: { modifier: 1, note: 'Standard VAT applies' },
      goods: { modifier: 1, note: 'Standard VAT applies' },
    }
  },
  SG: {
    name: 'Singapore',
    taxType: 'GST',
    states: {
      SG: { name: 'Singapore', rate: 9, note: 'GST (Goods and Services Tax)' },
    },
    categories: {
      general: { modifier: 1, note: 'GST 9% applies' },
      consulting: { modifier: 1, note: 'GST 9% applies' },
      digital: { modifier: 1, note: 'GST 9% applies' },
      saas: { modifier: 1, note: 'GST 9% applies' },
      goods: { modifier: 1, note: 'GST 9% applies' },
    }
  },
};

export const useTaxCalculator = () => {
  const [country, setCountry] = useState('US');
  const [state, setState] = useState('');
  const [category, setCategory] = useState('general');
  const [customRate, setCustomRate] = useState(0);
  const [suggestedRate, setSuggestedRate] = useState(0);

  // Get available states/provinces for selected country
  const getStates = (countryCode) => {
    return TAX_DATA[countryCode]?.states || {};
  };

  // Calculate suggested tax rate
  const calculateSuggestedRate = (countryCode, stateCode, categoryCode) => {
    const countryData = TAX_DATA[countryCode];
    if (!countryData) return { rate: 0, note: 'Country not found' };

    const stateData = countryData.states[stateCode];
    const categoryData = countryData.categories[categoryCode];

    if (!stateData) {
      // If no state selected, prompt user to select
      return {
        rate: 0,
        note: `Please select a ${countryCode === 'US' ? 'state' : 'province/region'}`,
        taxType: countryData.taxType
      };
    }

    const baseRate = stateData.rate;
    const modifier = categoryData?.modifier || 1;
    const finalRate = baseRate * modifier;

    return {
      rate: finalRate,
      note: stateData.note,
      taxType: countryData.taxType,
      categoryNote: categoryData?.note || '',
      stateName: stateData.name,
      countryName: countryData.name
    };
  };

  // Update suggested rate when country, state, or category changes
  useEffect(() => {
    const suggestion = calculateSuggestedRate(country, state, category);
    setSuggestedRate(suggestion.rate);
    
    // Auto-apply suggestion if custom rate is 0
    if (customRate === 0) {
      setCustomRate(suggestion.rate);
    }
  }, [country, state, category]);

  // Get tax information
  const getTaxInfo = () => {
    return calculateSuggestedRate(country, state, category);
  };

  // Get country data
  const getCountryData = (countryCode) => {
    return TAX_DATA[countryCode];
  };

  // Get all countries
  const getCountries = () => {
    return Object.keys(TAX_DATA).map(code => ({
      code,
      name: TAX_DATA[code].name,
      taxType: TAX_DATA[code].taxType
    }));
  };

  return {
    country,
    setCountry,
    state,
    setState,
    category,
    setCategory,
    customRate,
    setCustomRate,
    suggestedRate,
    getTaxInfo,
    getStates,
    getCountryData,
    getCountries,
    TAX_DATA
  };
};

export default useTaxCalculator;
