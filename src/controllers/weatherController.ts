import { Request, Response } from 'express';

// Mock data
const weatherData: Record<string, any> = {
  london: { temp: 15, condition: 'Rainy' },
  telaviv: { temp: 28, condition: 'Sunny' },
  newyork: { temp: 20, condition: 'Cloudy' }
};

export const getWeatherByCity = (req: Request, res: Response) => {
  const city = req.params.city.toLowerCase();
  const data = weatherData[city];

  if (!data) {
    return res.status(404).json({ error: 'City not found' });
  }

  res.json({ city, ...data });
};

export const updateWeatherReport = (req: Request, res: Response) => {
  const city = req.params.city.toLowerCase();
  const { temp, condition } = req.body;

  if (temp === undefined || !condition) {
    return res.status(400).json({ error: 'Missing temp or condition in body' });
  }

  // Update mock data
  weatherData[city] = { temp, condition };

  res.status(201).json({
    message: 'Weather report updated successfully',
    updatedData: { city, temp, condition }
  });
};
