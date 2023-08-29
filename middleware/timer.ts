import {Request,Response,NextFunction} from "express"

export const timer = async (req:Request,res:Response,next:NextFunction) =>{
    const start = new Date().getTime();
    await next();
    console.log(`use ${new Date().getTime()-start}ms`);
};
//export default timer;