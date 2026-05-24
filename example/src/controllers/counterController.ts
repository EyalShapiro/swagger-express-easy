import { Request, Response } from 'express';
import ERROR_MSG from '../constant/error_msg';

let counter = 0;

/**
 * Get the current counter value.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {void} Sends JSON response with counter value and timestamp.
 */
export const getCounter = (req: Request, res: Response): void => {
  const timeStamp = res.locals?.timeStamp || new Date().toUTCString();
  try {
    const statusCode = 200;
    res.status(statusCode).json({ message: `Counter: ${counter}`, counter, statusCode, timeStamp });
  } catch (error) {
    console.error(error);
    const statusCode = 500;
    res.status(statusCode).json({ message: ERROR_MSG.internal, statusCode, error, timeStamp });
  }
};

/**
 * Increment the counter by 1.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {void} Sends JSON response with updated counter value and timestamp.
 */
export const addOneCounter = (req: Request, res: Response): void => {
  const timeStamp = res.locals?.timeStamp || new Date().toUTCString();
  try {
    counter++;
    const statusCode = 200;
    const message = `add to now counter: ${counter}`;
    res.status(statusCode).json({ message, counter, statusCode, timeStamp });
  } catch (error) {
    console.error(error);
    const statusCode = 500;
    res.status(statusCode).json({ message: ERROR_MSG.internal, statusCode, error, timeStamp });
  }
};

/**
 * Decrement the counter by 1.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {void} Sends JSON response with updated counter value and timestamp.
 */
export const subOneCounter = (req: Request, res: Response): void => {
  const timeStamp = res.locals?.timeStamp || new Date().toUTCString();
  try {
    counter--;
    const statusCode = 200;
    const message = `sub to now counter: ${counter}`;
    res.status(statusCode).json({ message, counter, statusCode, timeStamp });
  } catch (error) {
    console.error(error);
    const statusCode = 500;
    res.status(statusCode).json({ message: ERROR_MSG.internal, statusCode, error, timeStamp });
  }
};

/**
 * Reset the counter to 0.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {void} Sends JSON response confirming counter reset with timestamp.
 */
export const deleteCounter = (req: Request, res: Response): void => {
  const timeStamp = res.locals?.timeStamp || new Date().toUTCString();
  try {
    counter = 0;
    const statusCode = 200;
    res.status(statusCode).json({ message: `Counter: ${counter}`, counter, statusCode, timeStamp });
  } catch (error) {
    console.error(error);
    const statusCode = 500;
    res.status(statusCode).json({ message: ERROR_MSG.internal, statusCode, error, timeStamp });
  }
};
