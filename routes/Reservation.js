const express = require('express');
const Reservation = require('../models/Reservation'); // Importar el modelo de Reservation
const User = require('../models/User'); // Importar el modelo de User
const router = express.Router();

// Validaciones

// Validar nombre (solo letras, puntos y comas)
const validateName = (name) => /^[a-zA-Z\s\.,áéíóúÁÉÍÓÚñÑ]+$/.test(name);

// Validar teléfono (solo números y el símbolo de +)
const validatePhoneNumber = (phone) => /^\+?[0-9]+$/.test(phone);

// Validar cantidad de personas (solo números)
const validateNumPeople = (num) => /^[0-9]+$/.test(num);

// Validar comentarios (solo letras, números, puntos, comas y paréntesis)
const validateComment = (comment) => /^[a-zA-Z0-9\s\.,\(\)áéíóúÁÉÍÓÚñÑ]*$/.test(comment);

// Validar fecha de reserva (no puede ser en el pasado)
const validateReservationDate = (date) => {
    const today = new Date();
    const reservationDate = new Date(date);
    return reservationDate >= today;
};

// Validación de hora
const validateTime = (time) => /^([0-9]{1,2}):([0-9]{2}) (AM|PM)$/.test(time);

// Crear una nueva reserva
router.post('/add', async (req, res) => {
    const { namePerson, phoneNumber, reservationDate, numPeople, comment, idClient, time } = req.body;

    // Validar campos
    if (!validateName(namePerson)) {
        return res.status(400).json({ message: 'El nombre solo puede contener letras, puntos y comas.' });
    }
    if (!validatePhoneNumber(phoneNumber)) {
        return res.status(400).json({ message: 'El teléfono solo puede contener números y el símbolo de +.' });
    }
    if (!validateNumPeople(numPeople)) {
        return res.status(400).json({ message: 'La cantidad de personas solo puede ser un número.' });
    }
    if (!validateReservationDate(reservationDate)) {
        return res.status(400).json({ message: 'La fecha de reserva no puede ser en el pasado.' });
    }
    if (!validateTime(time)) {
        return res.status(400).json({ message: 'La hora debe estar en formato hh:mm AM/PM.' });
    }
    if (!validateComment(comment)) {
        return res.status(400).json({ message: 'El comentario solo puede contener letras, números, puntos, comas y paréntesis.' });
    }

    try {
        const newReservation = await Reservation.create({
            namePerson,
            phoneNumber,
            reservationDate,
            numPeople,
            comment,
            idClient,
            reservationTime: time // Cambiar 'time' a 'reservationTime'
        });
        res.status(201).json(newReservation);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Error al crear la reserva' });
    }
});

// Actualizar una reserva por su ID
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { namePerson, phoneNumber, reservationDate, numPeople, comment, idClient, time } = req.body;

    // Validar campos
    if (namePerson && !validateName(namePerson)) {
        return res.status(400).json({ message: 'El nombre solo puede contener letras, puntos y comas.' });
    }
    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
        return res.status(400).json({ message: 'El teléfono solo puede contener números y el símbolo de +.' });
    }
    if (numPeople && !validateNumPeople(numPeople)) {
        return res.status(400).json({ message: 'La cantidad de personas solo puede ser un número.' });
    }
    if (reservationDate && !validateReservationDate(reservationDate)) {
        return res.status(400).json({ message: 'La fecha de reserva no puede ser en el pasado.' });
    }
    if (time && !validateTime(time)) {
        return res.status(400).json({ message: 'La hora debe estar en formato hh:mm AM/PM.' });
    }
    if (comment && !validateComment(comment)) {
        return res.status(400).json({ message: 'El comentario solo puede contener letras, números, puntos, comas y paréntesis.' });
    }

    try {
        const reservation = await Reservation.findByPk(id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        // Actualizar la reserva
        reservation.namePerson = namePerson || reservation.namePerson;
        reservation.phoneNumber = phoneNumber || reservation.phoneNumber;
        reservation.reservationDate = reservationDate || reservation.reservationDate;
        reservation.numPeople = numPeople || reservation.numPeople;
        reservation.comment = comment || reservation.comment;
        reservation.idClient = idClient || reservation.idClient;
        reservation.reservationTime = time || reservation.reservationTime;

        await reservation.save();
        res.json(reservation);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Error al actualizar la reserva' });
    }
});

// Eliminar una reserva por su ID
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const reservation = await Reservation.findByPk(id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }
        await reservation.destroy();
        res.status(200).json({ message: 'Reserva eliminada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar la reserva' });
    }
});

// Obtener todas las reservaciones con paginación
router.get('/list', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const reservations = await Reservation.findAll({
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        const totalReservations = await Reservation.count();
        const totalPages = Math.ceil(totalReservations / limit);

        res.json({
            reservations,
            totalPages,
            currentPage: parseInt(page),
            totalReservations
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las reservaciones' });
    }
});



module.exports = router;
