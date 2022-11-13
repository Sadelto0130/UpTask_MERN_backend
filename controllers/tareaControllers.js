import Proyecto from "../models/Proyecto.js";
import Tarea from '../models/Tarea.js'

const agregarTarea = async (req, resp) => {
  const { proyecto } = req.body;

  const existeProyecto = await Proyecto.findById(proyecto);

  if(!existeProyecto){
    const error = new Error("El Proyecto no existe");
    return resp.status(404).json({msg: error.message});
  }

  if(existeProyecto.creador.toString() !== req.usuario._id.toString()){
    const error = new Error("No tienes los permismos para añadir tareas");
    return resp.status(404).json({msg: error.message});
  }

  try {
    const tareaAlmacenada = await Tarea.create(req.body);

    //Almacenar el ID en el proyecto
    existeProyecto.tareas.push(tareaAlmacenada._id)
    await existeProyecto.save()
    /*<----------->*/
    
    return resp.json(tareaAlmacenada);

  } catch (error) {
    console.log(error);
  }
};

const obtenerTarea = async (req, resp) => {
  const { id } = req.params;

  const tarea = await Tarea.findById(id).populate("proyecto");

  if(!tarea){
    const error = new Error("Tarea no encontrada");
    return resp.status(404).json({msg: error.message});
  }

  if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion no valida");
    return resp.status(403).json({msg: error.message});
  }

  resp.json(tarea);
};

const actualizarTarea = async (req, resp) => {
  const { id } = req.params;
  const { nombre, descripcion, prioridad, fechaEntrega } = req.body;

  const tarea = await Tarea.findById(id).populate("proyecto");

  if(!tarea){
    const error = new Error("Tarea no encontrada");
    return resp.status(404).json({msg: error.message});
  }

  if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion no valida");
    return resp.status(403).json({msg: error.message});
  }

  tarea.nombre = nombre || tarea.nombre;
  tarea.descripcion = descripcion || tarea.descripcion;
  tarea.prioridad = prioridad || tarea.prioridad;
  tarea.fechaEntrega = fechaEntrega || tarea.fechaEntrega;

  try {
    const tareaAlmacenada = await tarea.save();
    resp.json(tareaAlmacenada);
  } catch (error) {
    console.log(error)
  }
};

const eliminarTarea = async (req, resp) => {
  const { id } = req.params;

  const tarea = await Tarea.findById(id).populate("proyecto");

  if(!tarea){
    const error = new Error("Tarea no encontrada");
    return resp.status(404).json({msg: error.message});
  }

  if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion no valida");
    return resp.status(403).json({msg: error.message});
  }

  try {
    const proyecto = await Proyecto.findById(tarea.proyecto);
    proyecto.tareas.pull(tarea._id)
    await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()])
    resp.json({msg: "la Tarea se elimió correctamente"})
  } catch (error) {
    console.log(error);
  }
};

const cambiarEstado = async (req, resp) => {
  const { id } = req.params;

  const tarea = await Tarea.findById(id).populate("proyecto");

  if(!tarea){
    const error = new Error("Tarea no encontrada");
    return resp.status(404).json({msg: error.message});
  }

  if(tarea.proyecto.creador.toString() !== req.usuario._id.toString() && !tarea.proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())) {
    const error = new Error("Accion no valida");
    return resp.status(403).json({msg: error.message});
  }

  tarea.estado = !tarea.estado;
  tarea.completado = req.usuario._id;
  await tarea.save();

  const tareaAlmacenada = await Tarea.findById(id)
    .populate("proyecto")
    .populate("completado");  

  resp.json(tareaAlmacenada)
};

export {
  agregarTarea,
  obtenerTarea,
  actualizarTarea, 
  eliminarTarea,
  cambiarEstado
}
