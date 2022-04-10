# Place data API

This is pretty simple ATM with only two routes (/pixels/all and /pixels/remaining).

To use this you first need to run `gendb.py` which will download the data and make it into a indexed database. From scratch this will take just under 100GB of storage with 30GB deletable. The API is a simple express app.