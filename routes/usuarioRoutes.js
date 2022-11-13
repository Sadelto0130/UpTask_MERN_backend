import express from "express";
const router = express.Router();

import { 
  registrar, 
  autenticar, 
  confirmar,
  recuperarPassword,
  comprobarToken,
  nuevoPass,
  perfil
 } from '../controllers/usuarioControllers.js';

 import checkAuth from '../middleware/checkAuth.js';

//Autenticacion, Registro y Confirmacion de Usuarios
router.post('/', registrar); //Crea un nuevo usuario
router.post('/login', autenticar);//Autenticar usuario
router.get('/confirmar/:token', confirmar)
router.post('/recuperar-password', recuperarPassword);
router.route('/recuperar-password/:token').get(comprobarToken).post(nuevoPass);

router.get('/perfil', checkAuth, perfil);

export default router;