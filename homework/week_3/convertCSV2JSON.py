#!/usr/bin/env python
# Name: Ruchella Kock
# Student number: 12460796
"""
This script transforms a csv file to a JSON file
"""


def main():
    import pandas as pd
    # columns to be loaded into dataframe
    columns = ["Year", "Murder and\nnonnegligent \nmanslaughter",
               "Rape\n(legacy \ndefinition4)", "Robbery",
               "Aggravated \nassault", "Property \ncrime", "Burglary",
               "Larceny-\ntheft", "Motor \nvehicle \ntheft"]
    # choose column names
    names_columns = ["Murder&manslaughter", "Rape", "Robbery",
                     "Aggrevated_assault", "Property_crime", "Burglary",
                     "Larcenytheft", "Motor vehicle theft"]

    # read csv into datframe
    df = pd.read_csv("crime.csv", skiprows=3, nrows=20, index_col=0, usecols=columns)

    # rename columns for ease
    df.columns = names_columns
    for column in names_columns:
        df[column].replace(regex=True, inplace=True, to_replace=r",", value=r"")
        df[column] = pd.to_numeric(df[column])

    preprocessing(df)

    # set to json file
    df.to_json(path_or_buf="crime.json", orient="index")


def preprocessing(df):
    list = []
    for x in df.index:
        if len(str(x)) != 4:
            x = str(x)
            x = x[:-1]
            list.append(x)
        else:
            list.append(x)
    df.index = list


if __name__ == "__main__":
    main()
