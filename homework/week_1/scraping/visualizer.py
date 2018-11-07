#!/usr/bin/env python
# Name: Ruchella Kock
# Student number: 1815458
"""
This script visualizes data obtained from a .csv file
"""

import csv
import matplotlib.pyplot as plt
from functools import reduce
from scipy import mean

# Global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018

# Global dictionary for the data
data_dict = {str(key): [] for key in range(START_YEAR, END_YEAR)}

# open the csv file and read it into a dictionary
with open('movies.csv', 'r') as movies:
    movies = csv.DictReader(movies, delimiter=',')
    for movie in movies:
        data_dict[movie["Year"]].append(float(movie["Rating"]))

    # calculate the average for every year
    avg = {}
    for key, value in data_dict.items():
        avg[key] = sum(value) / (len(value))

# sort the dictionary and plot it
plt.plot(*zip(*sorted(avg.items())), 'ro-', linewidth=2)
plt.xlabel("Year")
plt.ylabel("Average rating")
plt.title("Movie ratings between 2008 - 2017")
plt.show()
