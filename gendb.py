import sqlite3
import csv
import subprocess
from datetime import datetime, timedelta
import sys
from pathlib import Path

def progressbar(it, prefix="", size=100, file=sys.stdout):
    count = 160353105 # Hardcoded because I know the length
    time1 = datetime.now()
    time2 = datetime.now()
    def show(j):
        x = int(size*j/count)
        perc_done = (j + 1)/count
        elapsed = time2 - time1
        eta = elapsed/perc_done
        remaining = (eta-elapsed)
        file.write("%s[%s%s] %i/%i\t\t%s remaining\r" % (prefix, "#"*x, "."*(size-x), j, count, str(remaining).split(".")[0]))
        file.flush()        
    show(0)
    for i, item in enumerate(it):
        yield item
        if (i + 1) % 10000 == 0:
            time2 = datetime.now()
            show(i+1)
    file.flush()

print("Small note before you run this script. If you don't already know, this will take at the very least 55gb of storage. If you need to download the r/place dataset, add another 30gb to that.")

print("Running migrations...")
subprocess.run(['npx', 'sequelize', 'db:migrate'])
db = sqlite3.connect('db.sqlite')
cursor = db.cursor()
cursor.execute("DELETE FROM Pixels")
cursor.execute("DROP INDEX IF EXISTS pixels_time_user")
cursor.execute("DROP INDEX IF EXISTS pixels_user")
# Check if csv exists
print("Checking if data is downloaded...")
if not Path('2022_place_canvas_history.csv').is_file():
    print("You don't have the data csv extracted! Checking if the gzip is downloaded.")
    if not Path('2022_place_canvas_history.csv.gzip').is_file():
        print("You haven't downloaded the dataset. Downloading with wget (if you don't have this installed then install it lol.")
        subprocess.run(['wget', 'https://placedata.reddit.com/data/canvas-history/2022_place_canvas_history.csv.gzip'])
        print("Unzipping dataset with gzip")
        subprocess.run(['gzip', '-S', '.gzip', '-d', '-k', '2022_place_canvas_history.csv.gzip'])
    else:
        print("Extracting csv with gzip.")
        subprocess.run(['gunzip', '-S', '.gzip', '-d', '-k', '2022_place_canvas_history.csv.gzip'])

print("Processing CSV")
with open('2022_place_canvas_history.csv', 'r') as f:
    reader = csv.reader(f, delimiter=",")
    for i, line in enumerate(progressbar(reader)):
        if i == 0: continue
        try:
            timestamp = datetime.strptime(line[0], "%Y-%m-%d %H:%M:%S.%f UTC")
        except:
            # For whatever reason some don't have milliseconds. Whatever.
            timestamp = datetime.strptime(line[0], "%Y-%m-%d %H:%M:%S UTC")
        user_id = line[1]
        pixel_color = line[2]
        coords = line[3] # In the format x,y or x,y,x2,y2. x2 and y2 are optional
        coords_list = coords.split(',')
        x, y = int(coords_list[0]), int(coords_list[1])
        x2, y2 = None, None
        if len(coords_list) == 4:
            x2, y2 = int(coords_list[2]), int(coords_list[3])
            cursor.execute("INSERT INTO Pixels (timestamp, user_id, pixel_color, x, y, x2, y2, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?, DATE('now'), DATE('now'))", (timestamp, user_id, pixel_color, x, y, x2, y2))
            continue
        cursor.execute("INSERT INTO Pixels (timestamp, user_id, pixel_color, x, y, createdAt, updatedAt) VALUES (?,?,?,?,?, DATE('now'), DATE('now'))", (timestamp, user_id, pixel_color, x, y))
        if i % 10000 == 0: db.commit()

db.commit()

print("Indexing user_id")
cursor.execute("CREATE INDEX pixels_user ON Pixels(user_id)")
# NOTE: In theory this should work on both timestamp & user_id together as well as timestamp alonex
print("Indexing timestamp and user_id")
cursor.execute("CREATE INDEX pixels_time_user ON Pixels(timestamp, user_id)")
print("Indexing coordinates")
cursor.execute("CREATE INDEX pixels_coords ON Pixels(x, y)")

cursor.close()
db.close()
