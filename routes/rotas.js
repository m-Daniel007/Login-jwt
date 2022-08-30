const router = require('express').Router()
const User = require('../models/User')
const bcrypt  = require('bcrypt')
const jwt = require('jsonwebtoken')
const secret = '12345'

router
.get('/',(req,res)=>{
    res.status(200).json({msg:'Bem vindo a API com JWT!'})
})
.post('/cadastro', async(req,res)=>{
    const { name, email, password, confirmpassword } = req.body

    if(!name){
        return res.status(422).json({msg:'O nome é obrigatório!'})
    }
    if(!email){
        return res.status(422).json({msg:'O email é obrigatório!'})
    }
    if(!password){
        return res.status(422).json({msg:'A senha é obrigatória!'})
    }
    if(!confirmpassword){
        return res.status(422).json({msg:'A confirmação de senha é obrigatória!'})
    }
    if(password !==confirmpassword){
        return res.status(422).json({msg:'As senhas não conferem!'})
    }

    const existeUser = await User.findOne({email:email})

    if(existeUser){
        return res.status(422).json({msg:'O email já está cadastrado!'})
    }


    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password.toString(),salt)

    const user = new User({
        name,
        email,
        password:passwordHash
    })

    try {
        await user.save()
        res.status(201).json({msg:'Usuário criado com sucesso!'})
        
    } catch (error) {
        res.status(500).json({msg:'Ocorreu um erro interno, tente novamente!'})
    }
})

.get('/user/:id',verificaToken, async(req,res)=>{
    const {id} = req.params

    const user = await User.findById(id,'-password')

    if(!user){
        return res.status(404).json({msg:'Usuário não encontrado!'})
    }
    res.status(200).json(user)
})

.post('/login',async(req,res)=>{

    const { email,password }= req.body

    if(!email){
        return res.status(422).json({msg:'O email é obrigatório!'})
    }
    if(!password){
        return res.status(422).json({msg:'A senha é obrigatória!'})
    }


    const user = await User.findOne({email:email})

    if(!user){
        return res.status(404).json({msg:'Usuário não encontrado!'})
    }

    const verificaSenha = await bcrypt.compare(password.toString(),user.password)

    if(!verificaSenha){
        return res.status(422).json({msg:'Senha invalida!'})
    }

    try {
       
        const token = jwt.sign(
            {
                id:user._id
            },
            secret
        )
        res.status(200).json({msg:'Login realizado com sucesso!',token})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg:'Ocorreu um erro interno, tente novamente'})
    }
    

})






function verificaToken(req,res,next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]

    if(!token){
        return res.status(401).json({msg:'Acesso negado!'})
    }

    try {
       jwt.verify(token,secret)
       next()
    } catch (error) {
        res.status(400).json({msg:'Token invalido!'})
    }
}

module.exports = router