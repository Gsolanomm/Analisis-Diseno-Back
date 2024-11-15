const express = require('express');
const Notification = require('../models/Notification');
const { Op } = require('sequelize');
const router = express.Router();
const Users = require('../models/User');
const tables = require('../models/Tables');

// Obtener todas las notificaciones
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      include: ['User', 'Tables'],  // Incluir usuario y mesa asociados
    });
    res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las notificaciones' });
  }
});

// Crear una nueva notificación (asociando la mesa y el cliente)
router.post('/', async (req, res) => {
    const { idClient, idTable } = req.body;
  
    try {
      // Buscar los datos del cliente para obtener su rol
      const user = await Users.findByPk(idClient); // Suponiendo que tienes una tabla Users para los clientes
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
  
      // Verificar si el usuario es un administrador o mesero
      const isAdminOrWaiter = user.role === 'administrador' || user.role === 'mesero';
      if (isAdminOrWaiter) {
        return res.status(403).json({ message: 'Los administradores o meseros no pueden generar notificaciones' });
      }
  
      // Verificar si ya existe una notificación para este cliente
      const existingNotification = await Notification.findOne({
        where: { idClient },
      });
  
      if (existingNotification) {
        return res.status(400).json({ message: 'Ya tienes una mesa notificada' });
      }
  
      // Crear la nueva notificación
      const newNotification = await Notification.create({
        idClient, // ID del usuario que está creando la notificación
        idTable,  // ID de la mesa asociada a la notificación
      });
  
      res.status(201).json(newNotification);
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al crear la notificación' });
    }
  });
  

// Obtener notificaciones por mesa
router.get('/byTable/:tableId', async (req, res) => {
  const { tableId } = req.params;
  try {
    const notifications = await Notification.findAll({
      where: { idTable: tableId },
      include: ['User'],
    });
    res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las notificaciones de la mesa' });
  }
});

// Actualizar una notificación
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { idClient, idTable } = req.body;

  try {
    const notification = await Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    notification.idClient = idClient || notification.idClient;
    notification.idTable = idTable || notification.idTable;

    await notification.save();
    res.status(200).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la notificación' });
  }
});

// Eliminar una notificación
router.delete('/:idTable', async (req, res) => {
    const { idTable } = req.params; // ID de la mesa
    const { idClient } = req.body; // ID del cliente que realiza la solicitud

    try {
        // Buscar la notificación asociada con la mesa
        const notification = await Notification.findOne({
            where: { idTable }, // Filtramos por idTable
        });

        if (!notification) {
            return res.status(404).json({ message: 'No se encontró una notificación para esta mesa' });
        }

        // Buscar el usuario actual para verificar su rol
        const user = await Users.findByPk(idClient);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar si el usuario puede eliminar la notificación
        if (user.role === 'administrador' || user.role === 'mesero') {
            // Si el usuario es administrador o mesero, puede eliminar cualquier notificación
            await notification.destroy();
            return res.status(200).json({ message: 'Notificación eliminada con éxito' });
        } else if (notification.idClient === idClient) {
            // Si no es administrador o mesero, solo puede eliminar su propia notificación
            await notification.destroy();
            return res.status(200).json({ message: 'Notificación eliminada con éxito' });
        } else {
            // Si no es el propietario de la notificación, devolver error
            return res.status(403).json({ message: 'No puedes eliminar una notificación que no es tuya' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar la notificación' });
    }
});


// Obtener el ID de la mesa asociada al cliente
router.get('/byClient/:idClient', async (req, res) => {
    const { idClient } = req.params;

    try {
        // Buscar los datos del cliente para obtener su rol (aunque ya no se usará para la lógica)
        const user = await Users.findByPk(idClient); // Suponiendo que tienes una tabla Users para los clientes
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Obtener todas las notificaciones asociadas al cliente
        const notifications = await Notification.findAll();

        if (!notifications || notifications.length === 0) {
            return res.status(404).json({ message: 'No hay mesas notificadas para este cliente' });
        }

        // Obtener todas las mesas asociadas a las notificaciones
        const tableIds = notifications.map(notification => notification.idTable);

        const tablesData = await tables.findAll({
            where: {
                tableId: tableIds,
            }
        });

        // Responder con las mesas notificadas
        res.status(200).json(tablesData);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las mesas notificadas para el cliente' });
    }
});

  
  

module.exports = router;
