#!/usr/bin/env python
# Name: Ruchella Kock
# Student number: 12460796
"""
This script transforms a csv file to a JSON file
"""
import pandas as pd


def main():
    # columns to be loaded into dataframe
    columns = ["Country Name", "E-Participation Index"]
    # choose column names
    names_columns = ["country", "EPI"]

    # read csv into datframe
    df = pd.read_csv("EGOV_DATA_2018.csv", usecols=columns)

    # rename columns for ease
    df.columns = names_columns
    df["EPI"].replace(regex=True, inplace=True, to_replace=r",", value=r"")
    df["EPI"] = pd.to_numeric(df["EPI"])

    # set to json file
    df.to_json(path_or_buf="EGOV.json", orient='records')


if __name__ == "__main__":
    main()
