#!/usr/bin/env python
# Name: Ruchella Kock
# Student number: 1815458
"""
Perform a simple linear regression, check assumptions and write analysis
"""
import pandas as pd
from scipy import stats
import statsmodels.api as sm
import statsmodels.formula.api as smf
import statsmodels.stats.api as sms
from statsmodels.stats import outliers_influence
from statsmodels.graphics.regressionplots import abline_plot
import matplotlib.pyplot as plt

def test_assumptions(res, df):
    """
    checks the assumptions of:
    Linearity :
        - Chosen method is linear_harvey_collier it assumes:
        - "The Null hypothesis is that the regression is correctly modeled as linear."
    Homoscedasticity :
        - Chosen test is "Breusch-Pagan Lagrange Multiplier test for heteroscedasticity"
        - The Null hypothesis is that there is independent error variance
    Multicollinearity :
        - Chosen test Variance Inflation Factor (VIF)
    Outliers :
        - Chosen tests:
        Cooks distance indicates influential points that can influence the regression
        Standardized residuals checks if there are outliers on the dependant variable
        Boxplot checks if there outliers on the independent variable
        Influence plot: One plot that gives a summary of the outliers/ influential points
    Normality :
        - Chosen method P-P plot
    """
    # get the residuals
    pred_val = res.fittedvalues.copy()
    residuals = res.resid

    # counter to see how many assumptions are met
    counter = 0

    # check for linearity/ homoscedasticity visually
    plt.subplot(1, 2, 1)
    plt.scatter(pred_val, residuals)
    plt.axhline()
    plt.ylabel("Residuals")
    plt.xlabel("Predicted values")
    plt.title("Fig 1: Linearity/homoscedasticity check")
    """
    ----------- Fig 1 analysis -----------------
    The data looks approximately linear. (Evenly divided across the line)
    However as seen on the upper right side there are many values there
    whereas under the line there arent as many na_values
    This implies that the assumption of homoscedasticity may not be met
    """


    # check linearity assumption statistically
    print("\nCHECK ASSUMPTIONS")
    print("LINEARITY")
    print("At alpha = 0.01, ", end ="")
    linearity_assump = sms.linear_harvey_collier(res)
    if linearity_assump[1] < 0.01:
        print(f"Null hypothesis is rejected (F value = {linearity_assump[0]}, P value = {linearity_assump[1]})")
        print("This implies that there is no evidence of a linear relationship, assumption is NOT met")
        counter = counter + 1
    else:
        print(f"Null hypothesis is not rejected (F value = {linearity_assump[0]}, P value = {linearity_assump[1]})")
        print("This implies that there is evidence of a linear relationship, assumption is met")
    print()


    # check homoscedasticity assumption statistically
    print("HOMOSCEDASTICITY")
    test = sms.het_breuschpagan(res.resid, res.model.exog)
    print("At alpha = 0.01, ", end ="")
    if test[1] < 0.01:
        print(f"Null hypothesis is rejected (F value = {test[2]}, P value = {test[1]})")
        print("This implies that there is dependent error variance, assumption is NOT met\n")
        counter = counter + 1
    else:
        print(f"Null hypothesis is not rejected (F value = {test[2]}, P value =  {test[1]})")
        print("This implies that there is no dependent error variance, assumption is met\n")


    # check multicollinearity assumption
    print("MULTICOLLINEARITY")
    VIF = outliers_influence.variance_inflation_factor(res.model.exog, 0)
    print(f"VIF = {VIF}")
    if VIF < 10:
        print("There is no evidence of multicollinearity, VIF is smaller than 10")
        print("Assumption is met\n")
    else:
        print("There is evidence of multicollinearity, VIF is bigger than 10")
        print("Assumption is NOT met\n")
        counter = counter + 1


    # check for outliers
    print("OUTLIERS")
    oi = outliers_influence.OLSInfluence(res)
    outliers = oi.summary_frame()

    # check for influential cases
    df_cook = outliers["cooks_d"]
    df_residual = outliers["standard_resid"]
    length_cook = len(df_cook[df_cook > 1])
    if length_cook > 0:
        print(f"There are {length_cook} influential points")
        counter = counter + 1
    else:
        print("There are 0 influential points")

    # check for outliers on depndant variable
    max = len(df_residual[df_residual > 3])
    min = len(df_residual[df_residual < -3])
    length_residuals =  max + min
    if length_residuals > 3 :
        print(f"There are {length_residuals} outliers on dependant variable\n")
        counter = counter + 1
    else:
        print("There are 0 outliers on dependant variable\n")

    # check for outlier on independant variable
    plt.subplot(1, 2, 2)
    plt.boxplot(df["Deathrate"])
    plt.title("Fig 2: Deathrate (independant variable)")
    """
    ------------ Fig 2 analysis -----------
    The boxplot shows a mean of approx 7.
    However there are outliers as high as approx 29self.
    Moreover, it shows many outliers
    Based on the boxplox, it may be concluded that
    there are some outliers on the independant variable
    """

    # influence plot
    sm.graphics.influence_plot(res, criterion = "cooks")
    plt.title("Fig 3: Influence Plot")

    """
    ---------Fig 3 analysis ----------
    residuals are in one word "errors", studentizing makes it able to compare the residuals
    * leverage indicates how far away the independent variable values of an
      observation are from those of the other observations.
    A few countries such as (Iraq, Namibia etc) have high std residuals,
    however these countries have low leverage values
    (This is sort of surprising considering the boxplot of the independant variable)
    Most influential (as the criterion is cooks which gives the most influential cases)
    Are the countries (Lesotho, Swalandia, Botswana) have both high std res and leverage values
    * source: https://en.wikipedia.org/wiki/Leverage_(statistics)
    """


    # check for normality
    probplot = sm.ProbPlot(residuals, fit = True)
    probplot.ppplot(line = "r")
    plt.title("Fig 4: P-P Plot test of Normality")
    """
    ---------------Fig 4 analysis ------------
    The p-p plot looks approximately normal (The blue dots are close to the red line)
    we may assume that the assumption is met
    """

    return counter

def main():
    """
    Chosen variables are Literacy and Deathrate
    """
    # define the values that are to be considered as NaN
    na_values = ["unknown", "unknow"]

    # choose columns and rename them
    columns = ["Country", "Literacy (%)", "Deathrate"]
    names_columns = ["Literacy" , "Deathrate"]

    # read the csv into a dataframe
    df = pd.read_csv("input.csv", index_col = 0, usecols= columns, na_values = na_values, decimal = ",")
    df.columns = names_columns

    # drop NAN values from columns
    df = df.dropna()

    # -------------OLS---------------------
    mod = smf.ols(formula = "Literacy ~ Deathrate", data = df)
    res =  mod.fit()
    print(res.summary())

    # check if assumptions are met
    counter = test_assumptions(res, df)

    # anlyzise regression data
    print("ANALYSIS")
    print(f"F value = {res.fvalue}")
    print(f"P value = {res.f_pvalue}")
    if res.f_pvalue < 0.01:
        print(f"The null hypothesis of no relationship between {columns[1]} and {columns[2]} is rejected")
        print("This means we may assume there is a linear relationship between them")
    else:
        print(f"The null hypothesis of no relationship between {columns[1]} and {columns[2]} is not rejected")
        print("This means we may assume there is no relationship between them")

    if counter > 0:
        print(f"However be wary of the results because {counter} assumption(s) is(are) not met\n")

    r_squared = res.rsquared
    print(f"R squared/ Variance Explained For(VAF) : {r_squared}")
    print(f"{r_squared * 100:.2f} % of the dependant variable {columns[1]} is explained by the independant variable {columns[2]}\n")

    # ----------- scipy linear regression-----------
    # note I use this for two reasons the intercept and slope are easy to find
    # moreover so I can compare if the two methods are identical
    regression = stats.linregress(y = df["Literacy"], x = df["Deathrate"])

    # show regression formula
    print("REGRESSION FORMULA")
    intercept = regression[1]
    slope = regression[0]
    plus = "" if slope < 0 else "+"
    print(f"{round(intercept,2):.2f} {plus} {round(slope,2):.2f} * {columns[2]}")

    # Plot the regression line
    ax = df.plot(x = "Deathrate", y = "Literacy", kind = "scatter")
    abline_plot(model_results = res, ax = ax)
    plt.xlabel("Deathrate")
    plt.ylabel("Literacy")
    plt.title("Fig 5: Regression Plot")
    """
    -------- Fig 5 analysis -----------
    With a high percentage of literacy, Deathrate is lower.
    There is a weak negative relationship between deathrate and literacy.
    This means the lower the literacy the higher the deathrate.
    """

    plt.show()

if __name__ == "__main__":
    main()
