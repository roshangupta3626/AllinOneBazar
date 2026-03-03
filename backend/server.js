// import express from 'express';
// import 'dotenv/config';
// import connectDB from './database/db.js';
// import cors from 'cors'

// import userRoute from './routes/userRoute.js';
// import productRoute from './routes/productRoute.js';
// import cartRoute from './routes/cartRoute.js';
// import orderRoute from './routes/orderRoute.js'

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(express.json());

// app.use(cors({
//     origin: process.env.FRONTEND_URL,
//     credentials: true
// }));

// app.use('/api/v1/user', userRoute);
// app.use('/api/v1/product', productRoute);
// app.use('/api/v1/cart', cartRoute);
// app.use('/api/v1/order', orderRoute)

// app.listen(PORT, () => {

//     connectDB();

//     console.log(`Server running on port ${PORT}`);

// })



import express from 'express';
import 'dotenv/config';
import connectDB from './database/db.js';
import cors from 'cors';

import userRoute from './routes/userRoute.js';
import productRoute from './routes/productRoute.js';
import cartRoute from './routes/cartRoute.js';
import orderRoute from './routes/orderRoute.js';

const app = express();

// 1. Render provides the PORT dynamically. Always prioritize process.env.PORT.
const PORT = process.env.PORT || 3000; 

app.use(express.json());

// 2. Add a Home Route so you can see "Server is Live" in your browser
app.get('/', (req, res) => {
    res.status(200).send("AllinOneBazar Backend is Running on Render!");
});

// 3. Update CORS for testing
// Since you don't have a frontend yet, you might want to allow all origins temporarily 
// or ensure FRONTEND_URL in Render env is set correctly.
app.use(cors({
    origin: process.env.FRONTEND_URL || "*", 
    credentials: true
}));

app.use('/api/v1/user', userRoute);
app.use('/api/v1/product', productRoute);
app.use('/api/v1/cart', cartRoute);
app.use('/api/v1/order', orderRoute);

// 4. Improved Listen logic: Connect to DB BEFORE starting the server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1); // Exit if DB fails to connect
    }
};

startServer();