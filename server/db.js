import mongoose from 'mongoose';

import { env } from './config/env.js';


mongoose.set(
  'bufferCommands',
  false
);


export const connectDatabase =
  async () => {
    mongoose.connection.on(
      'connected',
      () => {
        console.log(
          '[Fintel] MongoDB connection established.'
        );
      }
    );

    mongoose.connection.on(
      'disconnected',
      () => {
        console.warn(
          '[Fintel] MongoDB disconnected.'
        );
      }
    );

    mongoose.connection.on(
      'error',
      (error) => {
        console.error(
          '[Fintel] MongoDB error:',
          error.message
        );
      }
    );

    await mongoose.connect(
      env.mongoUri,
      {
        serverSelectionTimeoutMS:
          5000,

        connectTimeoutMS:
          5000,

        socketTimeoutMS:
          10000,

        maxPoolSize:
          10,

        minPoolSize:
          1,
      }
    );
  };