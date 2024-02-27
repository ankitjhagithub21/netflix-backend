const mongoose = require('mongoose');

const connectDb = () => {
    mongoose.connect(process.env.DB_URL)
        .then(() => {
            console.log("Database connected");
        })
        .catch((error) => {
            console.error("Error connecting to database:", error);
        });
};

module.exports = connectDb;
