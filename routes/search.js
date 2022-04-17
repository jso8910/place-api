var express = require("express");
var router = express.Router();
const Pixel = require("../utils/database");
const { Op } = require("sequelize");

router.get("/", async (req, res, next) => {
  // I'm thinking that, even if the user defines just one pixel, the client will have x2 and y2 be equal to x1 and y1
  const params = ["t1", "t2", "x1", "y1", "x2", "y2"];
  if (!params.every((param) => Object.keys(req.query).includes(param))) {
    res.status(400);
    res.json({
      status: "error",
      message: "Incomplete request. All parameters must be sent.",
    });
    return;
  }

  // t1 and t2 are ISO8601 strings
  const dt1 = new Date(req.query.t1);
  const dt2 = new Date(req.query.t2);
  if (
    ![req.query.t1, req.query.t2].every(
      (date) => new Date(date) !== "Invalid Date" && !isNaN(new Date(date))
    )
  ) {
    res.status(400);
    res.json({ status: "error", message: "Timestamp invalid" });
    return;
  }
  const uid = req.query.uid ? { user_id: req.query.uid } : {};
  const pixels = await Pixel.findAll({
    where: {
      timestamp: {
        [Op.between]: [dt1, dt2],
      },
      x: {
        [Op.between]: [req.query.x1, req.query.x2],
      },
      y: {
        [Op.between]: [req.query.y1, req.query.y2],
      },
      x2: null,
      y2: null,
      ...uid,
    },
  });
  res.json({
    status: "ok",
    count: pixels.length,
    pixels: pixels,
  });
});

module.exports = router;
