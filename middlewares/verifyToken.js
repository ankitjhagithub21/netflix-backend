const jwt = require('jsonwebtoken')

const verifyToken = (req,res,next) =>{
    try{
        const token = req.headers.cookie;
       
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token Not found."
            }) 
        }
        const authToken = token.split('=')[1];
        
        const userData = jwt.verify(authToken,process.env.JWT_SECRET)
        
        if(!userData){
            return res.status(401).json({
                success:false,
                message:"Unauthorized."
            }) 
        }

        req.id = userData.id


        next()

    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

module.exports = verifyToken