import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './Database/Config.js';
import userRouter from './Routes/userRouter.js';
import urlRouter from './Routes/shorturlRouter.js';
import {createProxyMiddleware} from 'http-proxy-middleware';
dotenv.config;
const app = express();

// app.use(cors({
//     origin:"http://localhost:5173/",
//     credentials:true
// }))
app.use(cors());
app.use(express.json());
connectDB();

//Routes
app.use('/api/user',userRouter);
app.use('/api/url',urlRouter);
// app.use(
//     '/api/url/:urlId',
//     createProxyMiddleware({
//       target: 'http://localhost:5173/',
//       changeOrigin: true,
//     }),
//   );




app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json({
      success: false,
      statusCode,
      message,
    });
  });
  
app.get('/', (req, res) => {
  res.status(200).send('Welcome to URL Shortener');
});

app.listen(process.env.PORT, (req, res) => {
    console.log('App is running successfully');
})