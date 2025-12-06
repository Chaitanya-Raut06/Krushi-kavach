# 🌱 Krishi Kavach - AI-Powered Crop Disease Detection System

## 📌 Project Overview
Krishi Kavach is an intelligent agricultural assistant that helps farmers identify crop diseases using artificial intelligence. The system allows farmers to upload images of their crops, which are then analyzed by a deep learning model to detect potential diseases and provide actionable insights.

### Core Objectives
- Enable early detection of crop diseases through image analysis
- Provide accurate disease identification and treatment recommendations
- Support multiple regional languages for better accessibility
- Offer weather-based agricultural advisories
- Connect farmers with agricultural experts (agronomists)

### Target Users
- Small and medium-scale farmers
- Agricultural cooperatives
- Agronomists and agricultural experts
- Agricultural extension workers

### High-Level Architecture
```
┌─────────────┐     ┌───────────────┐     ┌────────────────┐
│   Frontend  │ ◄──►│   Backend     │ ◄──►│  ML Server     │
│  (React)    │     │  (Node/Express)│     │ (FastAPI)      │
└──────┬──────┘     └───────┬───────┘     └────────┬───────┘
       │                    │                       │
       │                    ▼                       │
       │             ┌───────────────┐             │
       └────────────►│  MongoDB      │◄────────────┘
                    └───────────────┘
```

## 🌐 Live Demo
Access the live application at: [https://krushikavach.netlify.app](https://krushikavach.netlify.app)

## ✨ Features

### 👨‍🌾 User Features
- User authentication (signup/login)
- Multi-language support (English + regional languages)
- Crop disease detection via image upload
- Disease information and treatment recommendations
- Weather information and alerts
- Agricultural advisories
- Profile management
- Disease history tracking

### 👨‍💼 Admin Features
- User management
- Agronomist approval system
- Content management
- System monitoring
- Report generation

### 🤖 ML Model Capabilities
- Image-based disease detection for multiple crops
- Real-time prediction with confidence scores
- Support for various plant diseases
- Model retraining capabilities

### 🔄 API Integration
- Weather data API
- Google's Generative AI for recommendations
- Cloudinary for image storage
- Map services for location-based features

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router v6
- **Internationalization**: i18next
- **Maps**: Leaflet
- **HTTP Client**: Axios
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Cloudinary
- **API Documentation**: OpenAPI/Swagger
- **Security**: Helmet, CORS, Rate Limiting

### Machine Learning
- **Framework**: TensorFlow/Keras
- **Model**: Custom CNN for image classification
- **API**: FastAPI
- **Deployment**: Containerized with Docker

### Hosting & Deployment
- **Frontend**: Netlify
- **Backend**: Render/Heroku
- **Database**: MongoDB Atlas
- **Storage**: Cloudinary
- **CI/CD**: GitHub Actions

## 📁 Project Structure

```
MERN/
├── frontend/                 # React frontend
│   ├── public/              # Static files
│   └── src/
│       ├── components/      # Reusable components
│       ├── pages/           # Page components
│       │   ├── admin/       # Admin pages
│       │   ├── agronomist/  # Agronomist pages
│       │   └── farmer/      # Farmer pages
│       ├── context/         # React context providers
│       ├── i18n/            # Internationalization
│       └── services/        # API services
│
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   └── server.js           # Application entry point
│
└── ml_server/              # ML model serving
    ├── saved_model/        # Trained model files
    ├── main.py            # FastAPI application
    └── requirements.txt    # Python dependencies
```

## 🚀 Installation Guide

### Prerequisites
- Node.js (v18+)
- Python (3.8+)
- MongoDB (v6.0+)
- npm (v9+)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the backend directory with the following variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   WEATHER_API_KEY=your_weather_api_key
   ML_SERVER_URL=http://localhost:8000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the frontend directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### ML Server Setup
1. Navigate to the ml_server directory:
   ```bash
   cd ml_server
   ```
2. Create a Python virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the ML server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## 🔒 Environment Variables

### Backend
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Application environment | No | `development` |
| `PORT` | Port to run the server on | No | `5000` |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret for JWT token signing | Yes | - |
| `JWT_EXPIRE` | JWT token expiration time | No | `30d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes | - |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes | - |
| `WEATHER_API_KEY` | Weather API key | Yes | - |
| `ML_SERVER_URL` | URL of the ML model server | Yes | - |

### Frontend
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_BASE_URL` | Base URL for API requests | Yes | - |

### ML Server
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `ML_SERVER_HOST` | Host to run the ML server on | No | `0.0.0.0` |
| `ML_SERVER_PORT` | Port to run the ML server on | No | `8000` |
| `MODEL_PATH` | Path to the trained model | No | `saved_model/plant_disease_model.h5` |
| `CLASS_NAMES_PATH` | Path to the class labels file | No | `labels.txt` |
| `IMAGE_SIZE` | Input image size for the model | No | `224` |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed origins | No | `*` |

## 📚 API Documentation

### Authentication
#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "farmer"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Disease Detection
#### Detect Disease from Image
```http
POST /api/detect-disease
Content-Type: multipart/form-data
Authorization: Bearer <token>

{
  "image": <file>,
  "cropType": "tomato"
}
```

#### Get Detection History
```http
GET /api/detection-history
Authorization: Bearer <token>
```

### Weather
#### Get Weather Data
```http
GET /api/weather?lat=12.9716&lng=77.5946
Authorization: Bearer <token>
```

## 🤖 Machine Learning Overview

### Dataset
- **Source**: [PlantVillage Dataset](https://plantvillage.psu.edu/)
- **Classes**: 38 plant disease categories
- **Images**: ~54,000+ high-quality images
- **Crops Covered**: Apple, Blueberry, Cherry, Corn, Grape, Orange, Peach, Bell Pepper, Potato, Raspberry, Soybean, Squash, Strawberry, Tomato

### Model Architecture
```
Model: "sequential"
_________________________________________________________________
Layer (type)                 Output Shape              Param #   
=================================================================
conv2d (Conv2D)              (None, 222, 222, 32)      896       
_________________________________________________________________
max_pooling2d (MaxPooling2D) (None, 111, 111, 32)      0         
_________________________________________________________________
conv2d_1 (Conv2D)            (None, 109, 109, 64)      18496     
_________________________________________________________________
max_pooling2d_1 (MaxPooling2 (None, 54, 54, 64)        0         
_________________________________________________________________
flatten (Flatten)            (None, 186624)            0         
_________________________________________________________________
dense (Dense)                (None, 128)               23888000  
_________________________________________________________________
dropout (Dropout)            (None, 128)               0         
_________________________________________________________________
dense_1 (Dense)              (None, 38)                4902      
=================================================================
Total params: 23,911,294
Trainable params: 23,911,294
Non-trainable params: 0
```

### Training
- **Framework**: TensorFlow/Keras
- **Epochs**: 20
- **Batch Size**: 32
- **Optimizer**: Adam
- **Learning Rate**: 0.001
- **Loss Function**: Categorical Crossentropy
- **Metrics**: Accuracy, Precision, Recall

### Input/Output Format
- **Input**: RGB image (224x224 pixels)
- **Output**: JSON object containing:
  ```json
  {
    "disease": "Tomato_Early_blight",
    "confidence": 0.9567,
    "description": "Early blight is a common tomato disease...",
    "treatment": [
      "Remove and destroy infected plant parts",
      "Apply fungicides containing chlorothalonil or copper"
    ]
  }
  ```

## 📱 Usage Guide

### 1. User Registration/Login
- Create an account with your email and password
- Verify your email address
- Log in to access the dashboard

### 2. Disease Detection
1. Navigate to the "Detect Disease" section
2. Select the crop type from the dropdown
3. Upload an image of the affected plant
4. View the detection results, including:
   - Identified disease
   - Confidence level
   - Disease description
   - Recommended treatments

### 3. Viewing History
- Access your detection history from the dashboard
- Filter by date, crop type, or disease
- View detailed reports of past detections

### 4. Weather Information
- Check current weather conditions for your location
- View 7-day weather forecast
- Receive weather alerts and agricultural advisories

## 🚀 Deployment

### Frontend Deployment (Netlify)
1. Push your code to a GitHub repository
2. Log in to Netlify and select "New site from Git"
3. Connect your GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables:
   - `VITE_API_BASE_URL`: Your backend API URL
6. Deploy the site

### Backend Deployment (Render/Heroku)
1. Create a new web service on Render/Heroku
2. Connect your GitHub repository
3. Configure environment variables
4. Set the build command: `npm install`
5. Set the start command: `node src/server.js`
6. Deploy the application

### ML Server Deployment
1. Build a Docker image:
   ```bash
   docker build -t krishi-kavach-ml .
   ```
2. Run the container:
   ```bash
   docker run -p 8000:8000 -e ENV_VARS=values krishi-kavach-ml
   ```

## 📸 Screenshots

### Home Page
![Home Page](/screenshots/home.png)

### Disease Detection
![Disease Detection](/screenshots/detection.png)

### Detection Results
![Results](/screenshots/results.png)

### Mobile View
![Mobile View](/screenshots/mobile.png)

## 🛠️ Troubleshooting

### Common Issues
1. **Image upload fails**
   - Check file size (max 5MB)
   - Ensure the image format is JPG, JPEG, or PNG
   - Verify Cloudinary credentials

2. **ML server not responding**
   - Check if the ML server is running
   - Verify the ML_SERVER_URL in backend .env
   - Check server logs for errors

3. **Authentication issues**
   - Ensure JWT token is included in the Authorization header
   - Check token expiration
   - Verify user role permissions

## 🤝 Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Keep the master branch stable

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔮 Future Improvements

### Short-term
- [ ] Add more crop varieties
- [ ] Improve model accuracy with more training data
- [ ] Implement push notifications for weather alerts
- [ ] Add offline functionality

### Long-term
- [ ] Mobile app development
- [ ] Multi-language support for all regional languages
- [ ] Integration with IoT devices
- [ ] Marketplace for agricultural products
- [ ] Drone imagery analysis

## 🙏 Acknowledgments
- [PlantVillage Dataset](https://plantvillage.psu.edu/)
- [TensorFlow](https://www.tensorflow.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [MongoDB](https://www.mongodb.com/)

## 📞 Contact
For any queries or support, please contact:
- Email: chaitanyaraut027@gmail.com
- Website: [https://krushikavach.com](https://krushikavach.com)
