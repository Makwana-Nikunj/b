import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

/**
 * Optimized MongoDB connection with connection pooling
 */
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}/${DB_NAME}`,
            {
                // Connection pool settings for better performance
                maxPoolSize: 10,            // Maximum connections in pool
                minPoolSize: 2,             // Keep minimum connections alive
                socketTimeoutMS: 45000,     // Close sockets after 45s of inactivity
                serverSelectionTimeoutMS: 5000,  // Timeout for server selection
                family: 4,                  // Use IPv4

                // Performance optimizations
                autoIndex: process.env.NODE_ENV !== 'production',  // Don't auto-create indexes in prod
            }
        );

        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);

        // Log connection pool status
        console.log(`Connection pool: min=${2}, max=${10}`);

    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1);
    }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
});

export default connectDB;