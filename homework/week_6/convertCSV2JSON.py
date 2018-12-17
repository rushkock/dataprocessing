#!/usr/bin/env python
# Name: Ruchella Kock
# Student number: 12460796
"""
This script transforms a csv file to a JSON file
"""
import pandas as pd


def main():
    columns = ["FIPS", "State", "Substate Region", "Small Area Estimate",
               "95% CI (Lower)", "95% CI (Upper)"]
    # choose column names
    names_columns = ["FIPS", "state", "substate", "percentage", "lower_CI",
                     "upper_CI"]

    # read csv into datframe
    df = pd.read_csv("all_disorders.csv", usecols=columns)

    df.columns = names_columns

    df["percentage"] = df["percentage"].map(lambda x: x.rstrip("%"))
    df["percentage"] = pd.to_numeric(df["percentage"])

    df["lower_CI"] = df["lower_CI"].map(lambda x: x.rstrip("%"))
    df["lower_CI"] = pd.to_numeric(df["lower_CI"])

    df["upper_CI"] = df["upper_CI"].map(lambda x: x.rstrip("%"))
    df["upper_CI"] = pd.to_numeric(df["upper_CI"])
    # set to json file
    df.to_json(path_or_buf="disorders.json", orient="records")


if __name__ == '__main__':
    main()
