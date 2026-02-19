# Stock Education Platform

A full-stack stock market learning platform that combines real-time stock data, trend visualization, and predictive insights to help beginners understand market behavior.
Built with FastAPI and React, the platform integrates external financial APIs to provide interactive charts and educational explanations of stock trends.

(see below for screenshots)
##  Problem

Beginner investors often struggle to interpret stock trends and understand price movements.

##  Solution

This platform simplifies market data into visual insights and predictive trendlines, making stock analysis accessible and educational.

##  Future Improvements

- User authentication
- Portfolio tracking
- Machine learning-based prediction
- Deployment to cloud (Render + Vercel)

# Features

-  Real-time stock data integration (Twelve Data API)
-  Interactive historical price charts
-  Trendline-based prediction model
-  Educational explanations of stock movements
-  Full-stack architecture (FastAPI + React)
-  Secure environment variable handling
-  Asynchronous API calls for performance

Full-stack stock analysis tool built with:

- FastAPI (Backend)
- React (Frontend)
- Twelve Data API
- Predictive trendline analysis

# Tech Stack

**Frontend**
- React
- TypeScript
- Chart.js

**Backend**
- FastAPI
- Python
- httpx
- Twelve Data API

**Dev Tools**
- Git
- GitHub
- Uvicorn


## How to Run

### Backend
cd backend
python -m uvicorn app.main:app --reload

### Frontend
cd frontend
npm install
npm run dev

## Environment Variables

Create a `.env` file in backend:

TWELVE_DATA_API_KEY=your_api_key_here

# Images
## Hover over the terms to see simple definitions and visuals
<img width="1904" height="968" alt="Screenshot (50)" src="https://github.com/user-attachments/assets/e23cd868-87e6-48e3-8bf5-a0f3e0b0321a" />
## See predicted trends and reccomended moves
<img width="1877" height="978" alt="Screenshot (46)" src="https://github.com/user-attachments/assets/0a79a381-8ec6-4871-a0dc-6d077e508581" />
## Ideal buy and sell prices
<img width="1896" height="991" alt="Screenshot (47)" src="https://github.com/user-attachments/assets/df3975e8-ac65-4395-a4f3-310243390e9b" />
## Highlighted stock pattern trends and their names
<img width="1896" height="993" alt="Screenshot (48)" src="https://github.com/user-attachments/assets/a763c372-ec72-4614-b0fd-f5379db27bc1" />
<img width="1887" height="1002" alt="Screenshot 2026-02-19 062922" src="https://github.com/user-attachments/assets/04877763-25e0-41c0-b7e9-6e60755661ed" />
<img width="1895" height="986" alt="Screenshot (49)" src="https://github.com/user-attachments/assets/b9bb2229-3c83-438e-9bff-e50e7bd83cff" />






