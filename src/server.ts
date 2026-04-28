import express from "express";

const app = express();

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'LIBRARY MANAGEMENT API'
    })
})

export { app };

export default app;
