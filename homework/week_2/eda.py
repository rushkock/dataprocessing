#!/usr/bin/env python
# Name: Ruchella Kock
# Student number: 1815458
"""
This script visualizes data obtained from a .csv file
Contains the following information:
Country, Region, Population, Area (sq. mi.),
Pop. Density (per sq. mi.), Coastline (coast/area ratio)
Net migration, Infant mortality (per 1000 births)
GDP ($ per capita) dollars, Literacy (%), Phones (per 1000)
Arable (%), Crops (%), Other (%), Climate, Birthrate
Deathrate, Agriculture, Industry, Service
"""
import csv
import json
import pandas as pd
import matplotlib.pyplot as plt

def is_outlier(mean, std, data, data_name):
    """
    This function finds outliers in the data
    """
    # find the 95%
    cut_off = std * 3
    # find the highest logical value and lowest value
    lower = mean - cut_off
    upper = mean + cut_off
    outliers = [x for x in data if x < lower or x > upper]
    print(f"{data_name} outliers: {len(outliers)}")
    outliers_removed = [x for x in data if x >= lower and x <= upper]
    return outliers_removed

def main():
    # define the values that are to be considered as NaN
    na_values = ["unknown", "unknow"]

    # put the columns to load in datframe into a list
    columns = ["Country", "Region","Pop. Density (per sq. mi.)",
               "Infant mortality (per 1000 births)", "GDP ($ per capita) dollars"]
    names_columns = ["Region", "Pop_density", "Infant_mortality", "GDP"]

    # read the csv into a dataframe
    df = pd.read_csv("input.csv", index_col= 0, usecols= columns, na_values = na_values, decimal=",")
    df.columns = names_columns

    # -------------preprocessing--------------
    # remove all non digits to GDP and make it of type numeric
    df['GDP'].replace(regex=True,inplace=True,to_replace=r'\D',value=r'')
    df["GDP"] = pd.to_numeric(df["GDP"])

    # remove extra spaces from region
    df["Region"] = df["Region"].apply(lambda x: x.rstrip())

    # check how many outliers the variables have
    print("OUTLIERS")
    is_outlier(df["Pop_density"].mean(), df["Pop_density"].std(), df["Pop_density"], "Pop density")
    data = is_outlier(df["GDP"].mean(), df["GDP"].std(), df["GDP"], "GDP")
    is_outlier(df["Infant_mortality"].mean(), df["Infant_mortality"].std(), df["Infant_mortality"], "Infant mortality")
    print()

    # ----------- GDP ----------------
    # get the central tendency of the GDP
    print("CENTRAL TENDENCY")
    mean_GDP = df["GDP"].mean()
    median_GDP = df["GDP"].median()
    mode_GDP = df["GDP"].mode()[0]
    std_GDP = df["GDP"].std()
    print(f"Mean GDP = {mean_GDP}\nMedian GDP = {median_GDP}\nMode GDP = {mode_GDP}\nStandard deviation GDP = {std_GDP}")
    print()

    # check for outliers and remove them, plot the GDP in a histogram
    plt.subplot(1, 2, 1)
    hist = plt.hist(data, bins=50)
    plt.title("GDP")
    plt.xlabel("$ per capita")
    plt.ylabel("Number of countries")

    # ----------- Infant mortality ----------------
    # 5 number summary of infant mortality
    print("5 NUMBER SUMMARY")
    print(df.Infant_mortality.describe())
    print()

    # make the boxplot
    plt.subplot(1, 2, 2)
    df["Infant_mortality"].plot(kind="box", title = "Infant mortality (per 1000 births)", label="")
    plt.suptitle("")

    plt.show()


    # write to json file
    df.to_json(path_or_buf="eda.json", orient='index')

if __name__ == '__main__':
    main()
