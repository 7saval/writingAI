import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: (err as Error).message || "Server Error" });
}