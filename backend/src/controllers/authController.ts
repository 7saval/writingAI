import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/Users";

// 회원가입
export async function signup(req: Request, res: Response, next: NextFunction) {
    try {
        const repo = AppDataSource.getRepository(User);
    } catch (error) {

    }
}

// 로그인
export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const repo = AppDataSource.getRepository(User);
    } catch (error) {

    }
}