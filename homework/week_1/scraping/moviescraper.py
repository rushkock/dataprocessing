#!/usr/bin/env python
# Name: Ruchella Kock
# Student number: 12460796
"""
This script scrapes IMDB and outputs a CSV file with highest rated movies.
"""

import csv
import re
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

TARGET_URL = "https://www.imdb.com/search/title?title_type=feature&release_date=2008-01-01,2018-01-01&num_votes=5000,&sort=user_rating,desc"
BACKUP_HTML = 'movies.html'
OUTPUT_CSV = 'movies.csv'


def extract_movies(dom):
    """
    Extract a list of highest rated movies from DOM (of IMDB page).
    Each movie entry should contain the following fields:
    - Title
    - Rating
    - Year of release (only a number!)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """
    containers = dom.find_all(class_="lister-item mode-advanced")
    movies = []
    for container in containers:
        movie = []
        # find title
        title = container.find("h3", class_="lister-item-header")
        movie.append(title.a.string)

        # find rating
        rating =  container.find("div", class_="inline-block ratings-imdb-rating")
        movie.append(rating.strong.string)

        # find the year of realease print without ()
        year_container = container.find("span", class_="lister-item-year")
        year = year_container.string
        # find the digits of the string to make sure you only find the year
        year = re.findall('\d+', year)
        year = "".join(year)
        movie.append(year)

        # find the stars
        rating_bar = container.find("div", class_="lister-item-content")
        p_with_stars = rating_bar.find_all("p", class_= "")
        span_in_p = p_with_stars[1].find("span")
        # if there are no stars then add an empty string
        if span_in_p != None:
            stars_list = span_in_p.find_next_siblings("a")
            stars = map(lambda star: star.string, stars_list)
            #print(list(stars))
            movie.append(",".join(list(stars)))
        else:
            movie.append("")

        # find runtime
        runtime = container.find("span", class_="runtime")
        movie.append(runtime.string)

        # add movie to the movies list
        movies.append(movie)
    return movies

def save_csv(outfile, movies):
    """
    Output a CSV file containing highest rated movies.
    """
    writer = csv.writer(outfile)
    writer.writerow(['Title', 'Rating', 'Year', 'Actors', 'Runtime'])
    for movie in movies:
        writer.writerow([m for m in movie])

    # ADD SOME CODE OF YOURSELF HERE TO WRITE THE MOVIES TO DISK
def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')

    # extract the movies (using the function you implemented)
    movies = extract_movies(dom)

    # write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'w', newline='') as output_file:
        save_csv(output_file, movies)
