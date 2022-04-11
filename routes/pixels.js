var express = require('express');
var router = express.Router();
const Pixel = require('../utils/database')
const { Op } = require("sequelize");

router.get('/remaining', async (req, res, next) => {
  if (req.query.uid === undefined) {
    res.status(400);
    res.json({status: 'error', message: 'Missing URL query uid'});
    return;
  }
  const pixels = await Pixel.findAll({
    where: {
      user_id: req.query.uid,
      timestamp: {
          [Op.lt]: new Date('2022-04-04 22:47:40.185000 UTC')
      }
    }
  });
  const pixel_on_coords = await Promise.all(pixels.map(pixel => {
    return Pixel.findAll({
      where: {
        x: pixel.x,
        y: pixel.y,
        timestamp: {
          [Op.lt]: new Date('2022-04-04 22:47:40.185000 UTC')
        }
      }
    });
  }));
  const remaining = pixels.filter((pixel, index) => {
    // I don't wanna deal with rectangles
    if (pixel.x2 !== null) {
      return false;
    }
    const pixel_on_coord = pixel_on_coords[index];
    const remaining = pixel_on_coord.map(n_pixel => {
      if (n_pixel.timestamp > pixel.timestamp) {
        return false;
      }
      return true;
    })
    return remaining.every(val => val === true);
  });
  res.json({
    status: 'ok',
    count: remaining.length,
    pixels: remaining
  });
});

router.get('/all', async (req, res, next) => {
  if (req.query.uid === undefined) {
    res.status(400);
    res.json({status: 'error', message: 'Missing URL query uid'});
    return;
  }
  const pixels = await Pixel.findAll({
    where: {
      user_id: req.query.uid
    }
  });
  res.json({
    status: 'ok',
    count: pixels.length,
    pixels: pixels
  });
});

module.exports = router;
