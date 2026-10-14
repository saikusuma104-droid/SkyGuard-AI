import numpy as np
import pandas as pd

from station_metadata import STATIONS


def robust_zscore(series):

    median = series.median()

    mad = np.median(
        np.abs(series - median)
    )

    if mad == 0 or np.isnan(mad):
        return pd.Series(
            np.zeros(len(series)),
            index=series.index
        )

    return 0.6745 * (series - median) / mad


def add_station_metadata(df):

    df["latitude"] = df["station_id"].map(
        lambda x: STATIONS[x]["latitude"]
        if x in STATIONS else np.nan
    )

    df["longitude"] = df["station_id"].map(
        lambda x: STATIONS[x]["longitude"]
        if x in STATIONS else np.nan
    )

    df["elevation"] = df["station_id"].map(
        lambda x: STATIONS[x]["elevation"]
        if x in STATIONS else np.nan
    )

    return df


def add_time_features(df):

    if "timestamp" not in df.columns:
        return df

    df["timestamp"] = pd.to_datetime(
        df["timestamp"],
        errors="coerce"
    )

    df["hour"] = df["timestamp"].dt.hour
    df["month"] = df["timestamp"].dt.month
    df["day_of_year"] = df["timestamp"].dt.dayofyear

    # Cyclic representation
    df["hour_sin"] = np.sin(
        2 * np.pi * df["hour"] / 24
    )

    df["hour_cos"] = np.cos(
        2 * np.pi * df["hour"] / 24
    )

    df["month_sin"] = np.sin(
        2 * np.pi * df["month"] / 12
    )

    df["month_cos"] = np.cos(
        2 * np.pi * df["month"] / 12
    )

    return df


def add_temporal_features(df):

    df = df.sort_values(
        ["station_id", "timestamp"]
    )

    grouped = df.groupby(
        "station_id",
        group_keys=False
    )

    # Previous observations
    df["temperature_delta"] = grouped[
        "temperature"
    ].diff()

    df["pressure_delta"] = grouped[
        "pressure"
    ].diff()

    df["humidity_delta"] = grouped[
        "humidity"
    ].diff()

    # Rolling median
    for column in [
        "temperature",
        "pressure",
        "humidity"
    ]:

        rolling_median = grouped[
            column
        ].transform(
            lambda x: x.shift(1)
            .rolling(12, min_periods=3)
            .median()
        )

        df[f"{column}_rolling_median"] = rolling_median

        df[f"{column}_deviation"] = (
            df[column] - rolling_median
        )

    return df


def add_station_baselines(df):

    # Station-specific statistics.
    # This prevents a hill station from being
    # compared directly with a coastal station.

    for column in [
        "temperature",
        "pressure",
        "humidity"
    ]:

        station_median = df.groupby(
            "station_id"
        )[column].transform("median")

        station_mad = df.groupby(
            "station_id"
        )[column].transform(
            lambda x: np.median(
                np.abs(
                    x - np.median(x)
                )
            )
        )

        station_mad = station_mad.replace(
            0,
            np.nan
        )

        df[f"{column}_station_z"] = (
            0.6745 *
            (
                df[column] -
                station_median
            ) /
            station_mad
        )

    return df


def add_physical_features(df):

    # Temperature / humidity consistency.
    # Approximate dew point using Magnus formula.

    temperature = df["temperature"]
    humidity = df["humidity"]

    safe_humidity = humidity.clip(
        lower=1,
        upper=100
    )

    a = 17.625
    b = 243.04

    gamma = (
        np.log(safe_humidity / 100)
        +
        (
            a * temperature /
            (b + temperature)
        )
    )

    dew_point = (
        b * gamma /
        (a - gamma)
    )

    df["estimated_dew_point"] = dew_point

    df["temperature_humidity_gap"] = (
        temperature - dew_point
    )

    return df


def build_features(df):

    df = df.copy()

    df = add_station_metadata(df)

    df = add_time_features(df)

    df = add_temporal_features(df)

    df = add_station_baselines(df)

    df = add_physical_features(df)

    return df
