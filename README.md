# Place data API

This is pretty simple ATM with only two routes (/pixels/all and /pixels/remaining).

To use this you first need to run `gendb.py` which will download the data and make it into a indexed database. From scratch this will take just under 100GB of storage with 30GB deletable. Another note: the script will take a few hours so make sure to leave your computer on while running it. There is a progress bar during the CSV processing but there isn't one during the indexing. The API is a simple express app.
