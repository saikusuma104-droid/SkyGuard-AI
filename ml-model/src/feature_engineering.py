import pandas as pd
import numpy as np


INPUT_FILE = "../../SkyGuard-Data/processed/skyguard_weather.csv"
OUTPUT_FILE = "../../SkyGuard-Data/processed/ml_features.csv"


# ============================================================
# LOAD DATA
# ============================================================

def load_data():

    print("=" * 60)
    print("SKYGUARD FEATURE ENGINEERING")
    print("=" * 60)

    df = pd.read_csv(INPUT_FILE)

    df["timestamp"] = pd.to_datetime(df["timestamp"])

    df = df.sort_values(
        ["station_id", "timestamp"]
    ).reset_index(drop=True)

    print(f"Loaded rows: {len(df)}")
    print(f"Stations: {df['station_id'].nunique()}")

    return df


# ============================================================
# TIME FEATURES
# ============================================================

def create_time_features(df):

    df["hour"] = df["timestamp"].dt.hour
    df["month"] = df["timestamp"].dt.month
    df["day_of_year"] = df["timestamp"].dt.dayofyear

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


# ============================================================
# EXACT TIME LOOKUP
# ============================================================

def add_time_difference(df, column, minutes, suffix):

    result = []

    for station_id, group in df.groupby("station_id"):

        group = group.sort_values("timestamp").copy()

        previous = group[
            ["timestamp", column]
        ].copy()

        previous["timestamp"] = (
            previous["timestamp"]
            + pd.Timedelta(minutes=minutes)
        )

        previous = previous.rename(
            columns={
                column: f"{column}_{suffix}"
            }
        )

        merged = pd.merge(
            group,
            previous[[
                "timestamp",
                f"{column}_{suffix}"
            ]],
            on="timestamp",
            how="left"
        )

        result.append(merged)

    return pd.concat(
        result,
        ignore_index=True
    )


# ============================================================
# HISTORICAL FEATURES
# ============================================================

def create_historical_features(df):

    print("\nCreating EXACT 1-hour historical features...")

    columns = [
        "temperature",
        "station_level_pressure",
        "sea_level_pressure",
        "relative_humidity"
    ]

    for column in columns:

        if column not in df.columns:
            continue

        df = add_time_difference(
            df,
            column,
            60,
            "1h_ago"
        )

        previous = f"{column}_1h_ago"

        df[f"{column}_change_1h"] = (
            df[column] - df[previous]
        )

        df[f"{column}_abs_change_1h"] = (
            df[f"{column}_change_1h"].abs()
        )

    return df


# ============================================================
# 30-MINUTE HISTORICAL FEATURES
# ============================================================

def create_30min_features(df):

    print("Creating EXACT 30-minute historical features...")

    columns = [
        "temperature",
        "station_level_pressure",
        "sea_level_pressure",
        "relative_humidity"
    ]

    for column in columns:

        if column not in df.columns:
            continue

        df = add_time_difference(
            df,
            column,
            30,
            "30m_ago"
        )

        previous = f"{column}_30m_ago"

        df[f"{column}_change_30m"] = (
            df[column] - df[previous]
        )

        df[f"{column}_abs_change_30m"] = (
            df[f"{column}_change_30m"].abs()
        )

    return df


# ============================================================
# ROLLING FEATURES
# ============================================================

def create_rolling_features(df):

    print("Creating rolling statistics...")

    for column in [
        "temperature",
        "station_level_pressure",
        "sea_level_pressure",
        "relative_humidity"
    ]:

        if column not in df.columns:
            continue

        # Only previous observations.
        # Current observation is excluded.

        previous = (
            df.groupby("station_id")[column]
            .shift(1)
        )

        df[f"{column}_rolling_mean"] = (
            previous
            .groupby(df["station_id"])
            .transform(
                lambda x: x.rolling(
                    window=6,
                    min_periods=2
                ).mean()
            )
        )

        df[f"{column}_rolling_std"] = (
            previous
            .groupby(df["station_id"])
            .transform(
                lambda x: x.rolling(
                    window=6,
                    min_periods=2
                ).std()
            )
        )

    return df


    df = create_rolling_features(df)

    df = create_deviation_features(df)

    df = create_deviation_features(df)

    df = clean_features(df)

    df.to_csv(
        OUTPUT_FILE,
        index=False
    )

    print("\n" + "=" * 60)
    print("FEATURE ENGINEERING COMPLETE")
    print("=" * 60)

    print(f"Rows: {len(df)}")
    print(f"Columns: {len(df.columns)}")
    print(f"\nOutput: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()